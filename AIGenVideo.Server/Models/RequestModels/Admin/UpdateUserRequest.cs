
using System.Text.Json.Serialization;

namespace AIGenVideo.Server.Models.RequestModels.Admin;

public class UpdateUserRequest
{
    [JsonPropertyName("name")]
    public string? FullName { get;  set; }
    [JsonPropertyName("email")]

    public string? Email { get;  set; }
    [JsonPropertyName("isLocked")]
    public bool IsLocked { get;  set; } = false;
    [JsonPropertyName("role")]
    public string? Role { get;  set; }
    [JsonPropertyName("toDate")]
    public DateTime? VipExpires { get;  set; }
}
