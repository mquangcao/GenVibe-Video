using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AIGenVideo.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class VideoData : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "videoData",
                columns: table => new
                {
                    id = table.Column<string>(type: "nvarchar(450)", nullable: false),
                    script = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    audioFileUrl = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false),
                    captions = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    imageList = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    createdBy = table.Column<string>(type: "nvarchar(255)", maxLength: 255, nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_videoData", x => x.id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "videoData");
        }
    }
}
