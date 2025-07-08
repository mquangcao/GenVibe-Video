using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AIGenVideo.Server.Data.Migrations
{
    /// <inheritdoc />
    public partial class SeedPlatform : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.InsertData(
                table: "Platforms",
                columns: new[] { "Id", "Code", "Name", "OAuthUrl", "ApiBaseUrl", "LogoUrl", "IsActive" },
                values: new object[,]
                {
                    { Guid.NewGuid().ToString(), "youtube", "YouTube", "https://accounts.google.com/o/oauth2/v2/auth", "https://www.googleapis.com", "https://upload.wikimedia.org/wikipedia/commons/b/b8/YouTube_Logo_2017.svg", true },
                    { Guid.NewGuid().ToString(), "facebook", "Facebook", "https://www.facebook.com/v18.0/dialog/oauth", "https://graph.facebook.com", "https://upload.wikimedia.org/wikipedia/commons/5/51/Facebook_f_logo_%282019%29.svg", true },
                    { Guid.NewGuid().ToString(), "tiktok", "TikTok", "https://open.tiktokapis.com/v2/platform/oauth/connect", "https://open.tiktokapis.com", "https://cdn.simpleicons.org/tiktok", true }
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {

        }
    }
}
