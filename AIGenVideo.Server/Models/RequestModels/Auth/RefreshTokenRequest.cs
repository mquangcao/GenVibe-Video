using System.Text.Json.Serialization;

namespace AIGenVideo.Server.Models.RequestModels.Auth;

public class RefreshTokenRequest
{
    [JsonPropertyName("refreshToken")]
    public string RefreshToken { get; set; } = string.Empty;
    [JsonPropertyName("username")]
    public string Username { get; set; } = string.Empty;
}
