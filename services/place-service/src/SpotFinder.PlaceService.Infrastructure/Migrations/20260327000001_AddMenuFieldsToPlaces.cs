using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpotFinder.PlaceService.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddMenuFieldsToPlaces : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "menu_url",
                schema: "place",
                table: "places",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "menu_image_urls",
                schema: "place",
                table: "places",
                type: "jsonb",
                nullable: false,
                defaultValueSql: "'[]'::jsonb");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "menu_url",
                schema: "place",
                table: "places");

            migrationBuilder.DropColumn(
                name: "menu_image_urls",
                schema: "place",
                table: "places");
        }
    }
}
