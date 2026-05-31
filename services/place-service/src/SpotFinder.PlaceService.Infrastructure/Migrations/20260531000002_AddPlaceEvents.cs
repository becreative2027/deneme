using Microsoft.EntityFrameworkCore.Migrations;

namespace SpotFinder.PlaceService.Infrastructure.Migrations;

public partial class AddPlaceEvents : Migration
{
    protected override void Up(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("""
            CREATE TABLE IF NOT EXISTS place.place_events (
                id          UUID        NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
                place_id    UUID        NOT NULL REFERENCES place.places(id) ON DELETE CASCADE,
                title       VARCHAR(200) NOT NULL,
                description VARCHAR(2000),
                starts_at   TIMESTAMPTZ NOT NULL,
                ends_at     TIMESTAMPTZ,
                image_url   VARCHAR(500),
                created_by  VARCHAR(200) NOT NULL DEFAULT '',
                created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
            );

            CREATE INDEX IF NOT EXISTS ix_place_events_place_id  ON place.place_events(place_id);
            CREATE INDEX IF NOT EXISTS ix_place_events_starts_at ON place.place_events(starts_at);
            """);
    }

    protected override void Down(MigrationBuilder migrationBuilder)
    {
        migrationBuilder.Sql("DROP TABLE IF EXISTS place.place_events;");
    }
}
