-- Mark EF Core migrations as applied for all Phase 1 services
-- EF Core stores migration history in __EFMigrationsHistory per default schema

-- Geo Service (schema: geo)
CREATE TABLE IF NOT EXISTS geo."__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

INSERT INTO geo."__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260321231826_InitialCreate', '9.0.3')
ON CONFLICT ("MigrationId") DO NOTHING;

-- Place Service (schema: place)
CREATE TABLE IF NOT EXISTS place."__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

INSERT INTO place."__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260321231826_InitialCreate', '9.0.3')
ON CONFLICT ("MigrationId") DO NOTHING;

-- Label Service (schema: label)
CREATE TABLE IF NOT EXISTS label."__EFMigrationsHistory" (
    "MigrationId" character varying(150) NOT NULL,
    "ProductVersion" character varying(32) NOT NULL,
    CONSTRAINT "PK___EFMigrationsHistory" PRIMARY KEY ("MigrationId")
);

INSERT INTO label."__EFMigrationsHistory" ("MigrationId", "ProductVersion")
VALUES ('20260321231826_InitialCreate', '9.0.3')
ON CONFLICT ("MigrationId") DO NOTHING;
