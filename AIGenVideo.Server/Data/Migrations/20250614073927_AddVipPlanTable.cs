using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AIGenVideo.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddVipPlanTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "VipPlans",
                columns: table => new
                {
                    Id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    Name = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Description = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Price = table.Column<decimal>(type: "decimal(18,2)", nullable: false),
                    DurationInMonths = table.Column<int>(type: "int", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_VipPlans", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_VipPlans_DurationInMonths",
                table: "VipPlans",
                column: "DurationInMonths",
                unique: true);

            
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "VipPlans");
        }
    }
}
