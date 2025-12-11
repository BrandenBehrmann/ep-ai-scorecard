-- Add pending_review and released status values to the constraint
-- This supports the controlled release workflow

ALTER TABLE assessments DROP CONSTRAINT IF EXISTS assessments_status_check;

ALTER TABLE assessments ADD CONSTRAINT assessments_status_check
  CHECK (status IN ('not_started', 'in_progress', 'submitted', 'report_ready', 'pending_review', 'released', 'paid'));

-- Add released_at column if it doesn't exist
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS released_at TIMESTAMP WITH TIME ZONE;
