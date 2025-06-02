using System.Text.Json.Serialization;

namespace AIGenVideo.Server.Models.ResponseModels.Auth;

public sealed record LoginResponse
{
    [JsonPropertyName("username")]
    public string Username { get; init; } = string.Empty;
    [JsonPropertyName("token")]
    public string Token { get; init; } = string.Empty;
    [JsonPropertyName("refreshToken")]
    public string RefreshToken { get; init; } = string.Empty;
    [JsonPropertyName("role")]
    public string Role { get; init; } = string.Empty;
}
