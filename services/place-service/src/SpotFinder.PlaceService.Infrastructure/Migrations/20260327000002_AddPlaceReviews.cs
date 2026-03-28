using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpotFinder.PlaceService.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPlaceReviews : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "place_reviews",
                schema: "place",
                columns: table => new
                {
                    id = table.Column<Guid>(type: "uuid", nullable: false, defaultValueSql: "gen_random_uuid()"),
                    place_id = table.Column<Guid>(type: "uuid", nullable: false),
                    user_id = table.Column<Guid>(type: "uuid", nullable: false),
                    username = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    display_name = table.Column<string>(type: "character varying(100)", maxLength: 100, nullable: false),
                    avatar_url = table.Column<string>(type: "character varying(500)", maxLength: 500, nullable: true),
                    rating = table.Column<int>(type: "integer", nullable: false),
                    comment = table.Column<string>(type: "character varying(2000)", maxLength: 2000, nullable: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false, defaultValueSql: "NOW()"),
                    updated_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("pk_place_reviews", x => x.id);
                });

            migrationBuilder.CreateIndex(
                name: "ix_place_reviews_place_id",
                schema: "place",
                table: "place_reviews",
                column: "place_id");

            migrationBuilder.CreateIndex(
                name: "ix_place_reviews_place_id_user_id",
                schema: "place",
                table: "place_reviews",
                columns: new[] { "place_id", "user_id" },
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "place_reviews",
                schema: "place");
        }
    }
}
