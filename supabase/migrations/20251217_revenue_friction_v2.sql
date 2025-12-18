-- Revenue Friction Diagnostic v2 Migration
-- December 2025

-- Add version column if not exists
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS version TEXT DEFAULT 'v2_revenue_friction';

-- Add constraint_result column if not exists
ALTER TABLE assessments ADD COLUMN IF NOT EXISTS constraint_result JSONB DEFAULT NULL;

-- Mark existing assessments as v1 legacy
UPDATE assessments SET version = 'v1_legacy' WHERE version IS NULL OR version = 'v2_revenue_friction';

-- Update status constraint to include new statuses
ALTER TABLE assessments DROP CONSTRAINT IF EXISTS assessments_status_check;
ALTER TABLE assessments ADD CONSTRAINT assessments_status_check 
  CHECK (status IN ('not_started', 'in_progress', 'submitted', 'pending_review', 'report_ready', 'released'));
