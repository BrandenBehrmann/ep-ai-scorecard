-- Fix status check constraint to include all valid values
-- Drop the old constraint and recreate with correct values

ALTER TABLE assessments DROP CONSTRAINT IF EXISTS assessments_status_check;

ALTER TABLE assessments ADD CONSTRAINT assessments_status_check
  CHECK (status IN ('not_started', 'in_progress', 'submitted', 'report_ready', 'paid'));
