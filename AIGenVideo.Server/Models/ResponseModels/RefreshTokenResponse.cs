using System.Text.Json.Serialization;

namespace AIGenVideo.Server.Models.ResponseModels;

public class RefreshTokenResponse
{
    [JsonPropertyName("token")]
    public string Token { get; set; } = string.Empty;
    [JsonPropertyName("refreshToken")]
    public string RefreshToken { get; set; } = string.Empty;
}
