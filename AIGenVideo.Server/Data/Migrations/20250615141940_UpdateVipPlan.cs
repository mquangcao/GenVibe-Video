using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AIGenVideo.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class UpdateVipPlan : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Price",
                table: "VipPlans",
                newName: "Savings");

            migrationBuilder.AddColumn<string>(
                name: "Currency",
                table: "VipPlans",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<decimal>(
                name: "OriginalPrice",
                table: "VipPlans",
                type: "decimal(18,2)",
                nullable: false,
                defaultValue: 0m);

            migrationBuilder.AddColumn<string>(
                name: "Period",
                table: "VipPlans",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.InsertData(
                table: "VipPlans",
                columns: new[] { "Id", "Name", "Description", "OriginalPrice", "Savings", "Currency", "Period", "DurationInMonths", "CreatedAt", "UpdatedAt" },
                values: new object[,]
                {
                    {Guid.NewGuid().ToString(), "Free", "Plan free", 0m, 0m, "VND", "free", 0, DateTime.UtcNow, DateTime.UtcNow },
                    {Guid.NewGuid().ToString(), "VIP Monthly", "Plan 1 month", 50000m, 0m, "VND", "month", 1, DateTime.UtcNow, DateTime.UtcNow },
                    {Guid.NewGuid().ToString(), "VIP Yearly", "Plan 1 year", 600000m, 100000m, "VND", "year", 12, DateTime.UtcNow, DateTime.UtcNow},
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Currency",
                table: "VipPlans");

            migrationBuilder.DropColumn(
                name: "OriginalPrice",
                table: "VipPlans");

            migrationBuilder.DropColumn(
                name: "Period",
                table: "VipPlans");

            migrationBuilder.RenameColumn(
                name: "Savings",
                table: "VipPlans",
                newName: "Price");
        }
    }
}
