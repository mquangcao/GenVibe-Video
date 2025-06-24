using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace AIGenVideo.Server.Models.RequestModels.Auth;

public class RegisterRequest
{
    [Required]
    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;
    [Required]
    [JsonPropertyName("password")]
    public string Password { get; set; } = string.Empty;
    [Required]
    [JsonPropertyName("name")]
    public string FullName { get; set; } = string.Empty;
}
