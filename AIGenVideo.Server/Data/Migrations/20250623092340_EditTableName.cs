using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AIGenVideo.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class EditTableName : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_videoData",
                table: "videoData");

            migrationBuilder.RenameTable(
                name: "videoData",
                newName: "VideoData");

            migrationBuilder.AddPrimaryKey(
                name: "PK_VideoData",
                table: "VideoData",
                column: "id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropPrimaryKey(
                name: "PK_VideoData",
                table: "VideoData");

            migrationBuilder.RenameTable(
                name: "VideoData",
                newName: "videoData");

            migrationBuilder.AddPrimaryKey(
                name: "PK_videoData",
                table: "videoData",
                column: "id");
        }
    }
}
