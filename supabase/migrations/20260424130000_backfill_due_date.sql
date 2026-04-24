-- Backfill due_date for existing targets that have no due date set
-- Uses created_at + 7 days as the default
UPDATE targets
  SET due_date = (created_at::date + INTERVAL '7 days')::date
  WHERE due_date IS NULL;
