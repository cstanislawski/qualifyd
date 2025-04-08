-- Enhance organizations table with subscription fields
ALTER TABLE organizations
ADD COLUMN IF NOT EXISTS subscription_start_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_end_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS subscription_status VARCHAR(50) DEFAULT 'active',
ADD COLUMN IF NOT EXISTS payment_due_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS last_payment_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS payment_method VARCHAR(255),
ADD COLUMN IF NOT EXISTS payment_method_details JSONB,
ADD COLUMN IF NOT EXISTS auto_renew BOOLEAN DEFAULT TRUE,
ADD COLUMN IF NOT EXISTS email_reminders BOOLEAN DEFAULT TRUE,
-- Remove legacy quota fields
DROP COLUMN IF EXISTS max_users,
DROP COLUMN IF EXISTS max_templates,
DROP COLUMN IF EXISTS max_environments,
DROP COLUMN IF EXISTS max_runtime;

-- Quota tracking table for organizations
CREATE TABLE IF NOT EXISTS organization_quotas (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- User quotas
    max_users INT NOT NULL DEFAULT 10,
    current_users INT NOT NULL DEFAULT 0,

    -- Template quotas
    max_task_templates INT NOT NULL DEFAULT 5,
    current_task_templates INT NOT NULL DEFAULT 0,
    max_environment_templates INT NOT NULL DEFAULT 5,
    current_environment_templates INT NOT NULL DEFAULT 0,
    max_assessment_templates INT NOT NULL DEFAULT 5,
    current_assessment_templates INT NOT NULL DEFAULT 0,

    -- Assessment quotas
    max_assessments_per_month INT NOT NULL DEFAULT 10,
    assessments_this_month INT NOT NULL DEFAULT 0,
    max_concurrent_environments INT NOT NULL DEFAULT 2,
    current_active_environments INT NOT NULL DEFAULT 0,

    -- Resource quotas
    included_environment_minutes INT NOT NULL DEFAULT 900,
    used_environment_minutes INT NOT NULL DEFAULT 0,
    max_environment_runtime_minutes INT NOT NULL DEFAULT 120,
    max_snapshot_retention_days INT NOT NULL DEFAULT 7,

    -- Tracking fields
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add unique constraint on organization_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_organization_quotas_org_id ON organization_quotas(organization_id);

-- Billing records table
CREATE TABLE IF NOT EXISTS billing_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) NOT NULL DEFAULT 'USD',
    transaction_id VARCHAR(255),
    payment_method VARCHAR(50),
    status VARCHAR(50) NOT NULL, -- 'pending', 'successful', 'failed', 'refunded'
    description TEXT,
    invoice_url TEXT,
    receipt_url TEXT,
    payment_date TIMESTAMP WITH TIME ZONE,
    billing_period_start TIMESTAMP WITH TIME ZONE,
    billing_period_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add index for billing records by organization ID
CREATE INDEX IF NOT EXISTS idx_billing_records_org_id ON billing_records(organization_id);

-- Resource usage tracking table
CREATE TABLE IF NOT EXISTS usage_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    resource_type VARCHAR(50) NOT NULL, -- 'environment_minutes', 'assessments', etc.
    quantity DECIMAL(10,2) NOT NULL,
    usage_date TIMESTAMP WITH TIME ZONE NOT NULL,
    assessment_id UUID REFERENCES assessments(id) ON DELETE SET NULL,
    environment_template_id UUID REFERENCES environment_templates(id) ON DELETE SET NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    details JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_usage_records_org_id_date ON usage_records(organization_id, usage_date);
CREATE INDEX IF NOT EXISTS idx_usage_records_resource_type ON usage_records(resource_type);
CREATE INDEX IF NOT EXISTS idx_usage_records_assessment_id ON usage_records(assessment_id);

-- Add organization quota triggers
CREATE OR REPLACE FUNCTION update_template_quota() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        IF TG_TABLE_NAME = 'task_templates' THEN
            UPDATE organization_quotas
            SET current_task_templates = current_task_templates + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE organization_id = NEW.organization_id;
        ELSIF TG_TABLE_NAME = 'environment_templates' THEN
            UPDATE organization_quotas
            SET current_environment_templates = current_environment_templates + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE organization_id = NEW.organization_id;
        ELSIF TG_TABLE_NAME = 'assessment_templates' THEN
            UPDATE organization_quotas
            SET current_assessment_templates = current_assessment_templates + 1,
                updated_at = CURRENT_TIMESTAMP
            WHERE organization_id = NEW.organization_id;
        END IF;
    ELSIF TG_OP = 'DELETE' THEN
        IF TG_TABLE_NAME = 'task_templates' THEN
            UPDATE organization_quotas
            SET current_task_templates = GREATEST(0, current_task_templates - 1),
                updated_at = CURRENT_TIMESTAMP
            WHERE organization_id = OLD.organization_id;
        ELSIF TG_TABLE_NAME = 'environment_templates' THEN
            UPDATE organization_quotas
            SET current_environment_templates = GREATEST(0, current_environment_templates - 1),
                updated_at = CURRENT_TIMESTAMP
            WHERE organization_id = OLD.organization_id;
        ELSIF TG_TABLE_NAME = 'assessment_templates' THEN
            UPDATE organization_quotas
            SET current_assessment_templates = GREATEST(0, current_assessment_templates - 1),
                updated_at = CURRENT_TIMESTAMP
            WHERE organization_id = OLD.organization_id;
        END IF;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for each template type
CREATE TRIGGER task_template_quota_trigger
AFTER INSERT OR DELETE ON task_templates
FOR EACH ROW EXECUTE FUNCTION update_template_quota();

CREATE TRIGGER environment_template_quota_trigger
AFTER INSERT OR DELETE ON environment_templates
FOR EACH ROW EXECUTE FUNCTION update_template_quota();

CREATE TRIGGER assessment_template_quota_trigger
AFTER INSERT OR DELETE ON assessment_templates
FOR EACH ROW EXECUTE FUNCTION update_template_quota();

-- Function to update user count for an organization
CREATE OR REPLACE FUNCTION update_user_quota() RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' OR (TG_OP = 'UPDATE' AND NEW.organization_id IS NOT NULL AND (OLD.organization_id IS NULL OR OLD.organization_id != NEW.organization_id)) THEN
        UPDATE organization_quotas
        SET current_users = current_users + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE organization_id = NEW.organization_id;
    ELSIF TG_OP = 'DELETE' OR (TG_OP = 'UPDATE' AND OLD.organization_id IS NOT NULL AND (NEW.organization_id IS NULL OR OLD.organization_id != NEW.organization_id)) THEN
        UPDATE organization_quotas
        SET current_users = GREATEST(0, current_users - 1),
            updated_at = CURRENT_TIMESTAMP
        WHERE organization_id = OLD.organization_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create user quota trigger
CREATE TRIGGER user_quota_trigger
AFTER INSERT OR UPDATE OR DELETE ON users
FOR EACH ROW EXECUTE FUNCTION update_user_quota();

-- Function to update assessment counts
CREATE OR REPLACE FUNCTION update_assessment_quota() RETURNS TRIGGER AS $$
DECLARE
    org_id UUID;
BEGIN
    -- Get the organization ID from the assessment template
    IF TG_OP = 'INSERT' THEN
        SELECT organization_id INTO org_id
        FROM assessment_templates
        WHERE id = NEW.assessment_template_id;

        -- Update the assessment count
        UPDATE organization_quotas
        SET assessments_this_month = assessments_this_month + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE organization_id = org_id;

        -- Create a usage record
        INSERT INTO usage_records (
            organization_id,
            resource_type,
            quantity,
            usage_date,
            assessment_id,
            user_id,
            details
        ) VALUES (
            org_id,
            'assessment_created',
            1,
            CURRENT_TIMESTAMP,
            NEW.id,
            NEW.created_by,
            jsonb_build_object('status', NEW.status)
        );
    END IF;

    -- When assessment status changes to 'in_progress', increment active environments
    IF TG_OP = 'UPDATE' AND NEW.status = 'in_progress' AND OLD.status != 'in_progress' THEN
        SELECT organization_id INTO org_id
        FROM assessment_templates
        WHERE id = NEW.assessment_template_id;

        UPDATE organization_quotas
        SET current_active_environments = current_active_environments + 1,
            updated_at = CURRENT_TIMESTAMP
        WHERE organization_id = org_id;
    END IF;

    -- When assessment status changes from 'in_progress' to something else, decrement active environments
    IF TG_OP = 'UPDATE' AND OLD.status = 'in_progress' AND NEW.status != 'in_progress' THEN
        SELECT organization_id INTO org_id
        FROM assessment_templates
        WHERE id = NEW.assessment_template_id;

        UPDATE organization_quotas
        SET current_active_environments = GREATEST(0, current_active_environments - 1),
            updated_at = CURRENT_TIMESTAMP
        WHERE organization_id = org_id;
    END IF;

    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Create assessment quota trigger
CREATE TRIGGER assessment_quota_trigger
AFTER INSERT OR UPDATE ON assessments
FOR EACH ROW EXECUTE FUNCTION update_assessment_quota();

-- Add function to reset monthly assessment counts
CREATE OR REPLACE FUNCTION reset_monthly_assessment_counts() RETURNS VOID AS $$
BEGIN
    UPDATE organization_quotas
    SET assessments_this_month = 0,
        updated_at = CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql;

-- Add function to record environment usage minutes
CREATE OR REPLACE FUNCTION record_environment_usage(
    p_organization_id UUID,
    p_assessment_id UUID,
    p_minutes INTEGER
) RETURNS VOID AS $$
BEGIN
    -- Update the quota record
    UPDATE organization_quotas
    SET used_environment_minutes = used_environment_minutes + p_minutes,
        updated_at = CURRENT_TIMESTAMP
    WHERE organization_id = p_organization_id;

    -- Create a usage record
    INSERT INTO usage_records (
        organization_id,
        resource_type,
        quantity,
        usage_date,
        assessment_id,
        details
    ) VALUES (
        p_organization_id,
        'environment_minutes',
        p_minutes,
        CURRENT_TIMESTAMP,
        p_assessment_id,
        jsonb_build_object('minutes_used', p_minutes)
    );
END;
$$ LANGUAGE plpgsql;
