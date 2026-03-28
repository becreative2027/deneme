-- Add reporter_note column to moderation_items
-- Stores the reason the user provided when reporting content

ALTER TABLE admin.moderation_items
    ADD COLUMN IF NOT EXISTS reporter_note VARCHAR(500);
