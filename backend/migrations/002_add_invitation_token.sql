-- Add invitation token and expiry to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS invitation_token VARCHAR(255) UNIQUE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS invitation_expires_at TIMESTAMP WITH TIME ZONE;
