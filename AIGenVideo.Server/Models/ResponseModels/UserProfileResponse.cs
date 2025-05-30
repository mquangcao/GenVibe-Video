using System.Text.Json.Serialization;

namespace AIGenVideo.Server.Models.ResponseModels;

public sealed record UserProfileResponse
{
    [JsonPropertyName("avatar")]
    public string Avatar { get; set; } = string.Empty;
    [JsonPropertyName("username")]
    public string Username { get; set; } = string.Empty;
    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
    [JsonPropertyName("role")]
    public string Role { get; set; } = string.Empty;

}
