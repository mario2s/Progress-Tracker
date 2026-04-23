-- Add priority and is_done columns to targets table
ALTER TABLE targets ADD COLUMN IF NOT EXISTS priority INTEGER DEFAULT 1;
ALTER TABLE targets ADD COLUMN IF NOT EXISTS is_done BOOLEAN DEFAULT false;

-- Create index for priority sorting
CREATE INDEX IF NOT EXISTS idx_targets_priority ON targets(priority ASC);

-- Add comment for documentation
COMMENT ON COLUMN targets.priority IS 'Priority level (1-5, lower is higher priority)';
COMMENT ON COLUMN targets.is_done IS 'Mark target as completed';
