using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AIGenVideo.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddPackageIdForPayment : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "PackageId",
                table: "Payments",
                type: "nvarchar(450)",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Payments_PackageId",
                table: "Payments",
                column: "PackageId");

            migrationBuilder.AddForeignKey(
                name: "FK_Payments_VipPlans_PackageId",
                table: "Payments",
                column: "PackageId",
                principalTable: "VipPlans",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Payments_VipPlans_PackageId",
                table: "Payments");

            migrationBuilder.DropIndex(
                name: "IX_Payments_PackageId",
                table: "Payments");

            migrationBuilder.DropColumn(
                name: "PackageId",
                table: "Payments");
        }
    }
}
