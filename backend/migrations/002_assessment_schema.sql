-- Environment Templates
CREATE TABLE IF NOT EXISTS environment_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL, -- 'k8s', 'linux', 'docker', etc.
    specs JSONB NOT NULL, -- CPU, RAM, storage requirements
    configuration JSONB NOT NULL, -- Software, services, configurations
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Task Templates
CREATE TABLE IF NOT EXISTS task_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT NOT NULL,
    time_limit INTEGER, -- in seconds, NULL for no limit
    points INTEGER DEFAULT 0,
    validation_script TEXT, -- script to validate task completion
    readiness_script TEXT, -- script to check environment readiness
    environment_setup_script TEXT, -- script to setup environment for this task
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Assessment Templates
CREATE TABLE IF NOT EXISTS assessment_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID REFERENCES organizations(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    environment_template_id UUID REFERENCES environment_templates(id),
    total_time_limit INTEGER, -- in seconds, NULL for no limit
    passing_score INTEGER DEFAULT 0,
    internet_access BOOLEAN DEFAULT FALSE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Assessment Template Tasks (mapping assessment templates to task templates with ordering)
CREATE TABLE IF NOT EXISTS assessment_template_tasks (
    assessment_template_id UUID REFERENCES assessment_templates(id) ON DELETE CASCADE,
    task_template_id UUID REFERENCES task_templates(id) ON DELETE CASCADE,
    order_index INTEGER NOT NULL,
    weight DECIMAL(5,2) DEFAULT 1.0, -- Weight for scoring, default is equal weight
    dependencies JSONB, -- Array of task IDs that must be completed before this task
    PRIMARY KEY (assessment_template_id, task_template_id)
);

-- Assessments (instances of assessment templates assigned to candidates)
CREATE TABLE IF NOT EXISTS assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_template_id UUID REFERENCES assessment_templates(id),
    candidate_id UUID REFERENCES users(id),
    status VARCHAR(50) NOT NULL DEFAULT 'scheduled', -- 'scheduled', 'in_progress', 'completed', 'expired'
    scheduled_start_time TIMESTAMP WITH TIME ZONE,
    actual_start_time TIMESTAMP WITH TIME ZONE,
    completion_time TIMESTAMP WITH TIME ZONE,
    total_score INTEGER,
    environment_id VARCHAR(255), -- ID of the provisioned environment
    feedback TEXT,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Assessment Tasks (instances of task templates within an assessment)
CREATE TABLE IF NOT EXISTS assessment_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    task_template_id UUID REFERENCES task_templates(id),
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'failed', 'skipped'
    start_time TIMESTAMP WITH TIME ZONE,
    completion_time TIMESTAMP WITH TIME ZONE,
    score INTEGER,
    attempts INTEGER DEFAULT 0,
    notes TEXT, -- Reviewer notes
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Environment Snapshots
CREATE TABLE IF NOT EXISTS environment_snapshots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    snapshot_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    snapshot_type VARCHAR(50) NOT NULL, -- 'initial', 'task_completion', 'final', 'custom'
    task_id UUID REFERENCES assessment_tasks(id), -- NULL for non-task related snapshots
    snapshot_location VARCHAR(255) NOT NULL, -- Where the snapshot is stored
    retention_period INTEGER, -- in days
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Command History
CREATE TABLE IF NOT EXISTS command_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    task_id UUID REFERENCES assessment_tasks(id), -- NULL if not associated with a specific task
    command TEXT NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    exit_code INTEGER,
    output TEXT,
    duration INTEGER -- in milliseconds
);

-- File Changes
CREATE TABLE IF NOT EXISTS file_changes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    task_id UUID REFERENCES assessment_tasks(id), -- NULL if not associated with a specific task
    file_path VARCHAR(255) NOT NULL,
    change_type VARCHAR(50) NOT NULL, -- 'create', 'modify', 'delete'
    content TEXT, -- NULL for delete
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Assessment Reviews
CREATE TABLE IF NOT EXISTS assessment_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID REFERENCES assessments(id) ON DELETE CASCADE,
    reviewer_id UUID REFERENCES users(id),
    score INTEGER,
    comments TEXT,
    recommendation VARCHAR(50), -- 'hire', 'consider', 'reject'
    review_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_env_templates_org ON environment_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_task_templates_org ON task_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_assessment_templates_org ON assessment_templates(organization_id);
CREATE INDEX IF NOT EXISTS idx_assessments_candidate ON assessments(candidate_id);
CREATE INDEX IF NOT EXISTS idx_assessments_template ON assessments(assessment_template_id);
CREATE INDEX IF NOT EXISTS idx_assessment_tasks_assessment ON assessment_tasks(assessment_id);
CREATE INDEX IF NOT EXISTS idx_command_history_assessment ON command_history(assessment_id);
CREATE INDEX IF NOT EXISTS idx_file_changes_assessment ON file_changes(assessment_id);
CREATE INDEX IF NOT EXISTS idx_env_snapshots_assessment ON environment_snapshots(assessment_id);
CREATE INDEX IF NOT EXISTS idx_assessment_reviews_assessment ON assessment_reviews(assessment_id);
