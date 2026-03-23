using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace SpotFinder.LabelService.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.EnsureSchema(
                name: "label");

            migrationBuilder.CreateTable(
                name: "label_categories",
                schema: "label",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    key = table.Column<string>(type: "text", nullable: false),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_label_categories", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "place_labels",
                schema: "label",
                columns: table => new
                {
                    place_id = table.Column<Guid>(type: "uuid", nullable: false),
                    label_id = table.Column<int>(type: "integer", nullable: false),
                    weight = table.Column<decimal>(type: "numeric(3,2)", precision: 3, scale: 2, nullable: false, defaultValue: 1.0m),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_place_labels", x => new { x.place_id, x.label_id });
                });

            migrationBuilder.CreateTable(
                name: "label_category_translations",
                schema: "label",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    category_id = table.Column<int>(type: "integer", nullable: false),
                    language_id = table.Column<int>(type: "integer", nullable: false),
                    display_name = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_label_category_translations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_label_category_translations_label_categories_category_id",
                        column: x => x.category_id,
                        principalSchema: "label",
                        principalTable: "label_categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "labels",
                schema: "label",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    category_id = table.Column<int>(type: "integer", nullable: false),
                    key = table.Column<string>(type: "text", nullable: false),
                    is_active = table.Column<bool>(type: "boolean", nullable: false, defaultValue: true),
                    created_at = table.Column<DateTime>(type: "timestamp with time zone", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_labels", x => x.Id);
                    table.ForeignKey(
                        name: "FK_labels_label_categories_category_id",
                        column: x => x.category_id,
                        principalSchema: "label",
                        principalTable: "label_categories",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "label_keywords",
                schema: "label",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    label_id = table.Column<int>(type: "integer", nullable: false),
                    language_id = table.Column<int>(type: "integer", nullable: false),
                    keyword = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_label_keywords", x => x.Id);
                    table.ForeignKey(
                        name: "FK_label_keywords_labels_label_id",
                        column: x => x.label_id,
                        principalSchema: "label",
                        principalTable: "labels",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "label_translations",
                schema: "label",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityAlwaysColumn),
                    label_id = table.Column<int>(type: "integer", nullable: false),
                    language_id = table.Column<int>(type: "integer", nullable: false),
                    display_name = table.Column<string>(type: "text", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_label_translations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_label_translations_labels_label_id",
                        column: x => x.label_id,
                        principalSchema: "label",
                        principalTable: "labels",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_label_categories_key",
                schema: "label",
                table: "label_categories",
                column: "key",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_label_category_translations_category_id_language_id",
                schema: "label",
                table: "label_category_translations",
                columns: new[] { "category_id", "language_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_label_keywords_label_id",
                schema: "label",
                table: "label_keywords",
                column: "label_id");

            migrationBuilder.CreateIndex(
                name: "IX_label_translations_label_id_language_id",
                schema: "label",
                table: "label_translations",
                columns: new[] { "label_id", "language_id" },
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_labels_category_id",
                schema: "label",
                table: "labels",
                column: "category_id");

            migrationBuilder.CreateIndex(
                name: "IX_labels_key",
                schema: "label",
                table: "labels",
                column: "key",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "label_category_translations",
                schema: "label");

            migrationBuilder.DropTable(
                name: "label_keywords",
                schema: "label");

            migrationBuilder.DropTable(
                name: "label_translations",
                schema: "label");

            migrationBuilder.DropTable(
                name: "place_labels",
                schema: "label");

            migrationBuilder.DropTable(
                name: "labels",
                schema: "label");

            migrationBuilder.DropTable(
                name: "label_categories",
                schema: "label");
        }
    }
}
