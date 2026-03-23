using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace SpotFinder.LabelService.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAiColumnsToLabelKeywords : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "confidence",
                schema: "label",
                table: "label_keywords",
                type: "numeric(5,2)",
                precision: 5,
                scale: 2,
                nullable: false,
                defaultValue: 1.0m);

            migrationBuilder.AddColumn<string>(
                name: "source",
                schema: "label",
                table: "label_keywords",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "confidence",
                schema: "label",
                table: "label_keywords");

            migrationBuilder.DropColumn(
                name: "source",
                schema: "label",
                table: "label_keywords");
        }
    }
}
