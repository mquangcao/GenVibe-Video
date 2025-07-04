using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AIGenVideo.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class EditColumn : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "imageList",
                table: "VideoData");

            migrationBuilder.RenameColumn(
                name: "script",
                table: "VideoData",
                newName: "imageListUrl");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "imageListUrl",
                table: "VideoData",
                newName: "script");

            migrationBuilder.AddColumn<string>(
                name: "imageList",
                table: "VideoData",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }
    }
}
