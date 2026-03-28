-- ============================================================
-- Place Notifications Table
-- Place owners can send 1 notification per day per place.
-- Audiences: 0=Favorites, 1=Wishlist, 2=Nearby
-- ============================================================

CREATE TABLE IF NOT EXISTS admin.place_notifications (
    id               UUID         NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
    place_id         UUID         NOT NULL,
    title            VARCHAR(80)  NOT NULL,
    body             VARCHAR(300) NOT NULL,
    type             VARCHAR(50)  NOT NULL,
    audience         SMALLINT     NOT NULL DEFAULT 0,
    sent_by          VARCHAR(256) NOT NULL,
    recipient_count  INT          NOT NULL DEFAULT 0,
    sent_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_place_notif_place_id ON admin.place_notifications (place_id);
CREATE INDEX IF NOT EXISTS idx_place_notif_sent_at  ON admin.place_notifications (sent_at DESC);
