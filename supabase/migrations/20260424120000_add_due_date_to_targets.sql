-- Add due_date column to targets table
ALTER TABLE targets
  ADD COLUMN IF NOT EXISTS due_date date DEFAULT NULL;
