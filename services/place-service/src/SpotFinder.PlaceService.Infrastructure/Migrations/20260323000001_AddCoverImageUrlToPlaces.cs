using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpotFinder.PlaceService.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddCoverImageUrlToPlaces : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "cover_image_url",
                schema: "place",
                table: "places",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "cover_image_url",
                schema: "place",
                table: "places");
        }
    }
}
