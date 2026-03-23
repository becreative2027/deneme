using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpotFinder.PlaceService.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddFinalScoreToPlaceScores : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "FinalScore",
                schema: "place",
                table: "place_scores",
                type: "numeric(5,2)",
                precision: 5,
                scale: 2,
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "FinalScore",
                schema: "place",
                table: "place_scores");
        }
    }
}
