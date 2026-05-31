using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpotFinder.PlaceService.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPlaceViews : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql(@"
                CREATE TABLE IF NOT EXISTS place.place_views (
                    id               UUID         NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
                    user_id          UUID         NOT NULL,
                    place_id         UUID         NOT NULL,
                    duration_seconds INTEGER,
                    created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
                );

                CREATE INDEX IF NOT EXISTS ix_place_views_place_id   ON place.place_views (place_id);
                CREATE INDEX IF NOT EXISTS ix_place_views_user_id    ON place.place_views (user_id);
                CREATE INDEX IF NOT EXISTS ix_place_views_created_at ON place.place_views (created_at DESC);
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP TABLE IF EXISTS place.place_views;");
        }
    }
}
