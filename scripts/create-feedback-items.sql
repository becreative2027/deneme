CREATE TABLE IF NOT EXISTS admin.feedback_items (
    id          UUID         NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    category    SMALLINT     NOT NULL,
    message     VARCHAR(1000) NOT NULL,
    user_id     VARCHAR(128),
    user_email  VARCHAR(256),
    is_reviewed BOOLEAN      NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_feedback_reviewed   ON admin.feedback_items (is_reviewed);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON admin.feedback_items (created_at DESC);
