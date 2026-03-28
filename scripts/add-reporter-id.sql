-- Add reporter_id to moderation_items for duplicate-report prevention
ALTER TABLE admin.moderation_items
    ADD COLUMN IF NOT EXISTS reporter_id VARCHAR(128);

CREATE INDEX IF NOT EXISTS idx_mod_reporter
    ON admin.moderation_items (reporter_id, target_type, target_id)
    WHERE reporter_id IS NOT NULL;
