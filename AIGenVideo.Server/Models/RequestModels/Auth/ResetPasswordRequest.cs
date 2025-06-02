using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace AIGenVideo.Server.Models.RequestModels.Auth;

public class ResetPasswordRequest
{
    [Required]
    [EmailAddress]
    public string Email { get; set; } = string.Empty;

    [Required]
    [JsonPropertyName("token")]

    public string Token { get; set; } = string.Empty;

    [Required]
    public string NewPassword { get; set; } = string.Empty;
}
