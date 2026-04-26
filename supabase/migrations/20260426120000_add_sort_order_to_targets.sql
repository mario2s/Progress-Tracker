-- Add manual sort order column for drag/reorder behavior
ALTER TABLE targets
  ADD COLUMN IF NOT EXISTS sort_order INTEGER;

-- Index to speed up ordered list retrieval per user
CREATE INDEX IF NOT EXISTS idx_targets_sort_order ON targets(sort_order ASC);

-- Backfill existing rows to preserve current visual order per user
WITH ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id
      ORDER BY priority ASC, created_at ASC
    ) - 1 AS new_sort_order
  FROM targets
)
UPDATE targets t
SET sort_order = r.new_sort_order
FROM ranked r
WHERE t.id = r.id
  AND t.sort_order IS NULL;
