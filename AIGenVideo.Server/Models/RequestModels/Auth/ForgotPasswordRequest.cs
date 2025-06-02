using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace AIGenVideo.Server.Models.RequestModels.Auth;

public sealed record ForgotPasswordRequest
{
    [Required]
    [MinLength(1)]
    [JsonPropertyName("email")]
    public string Email { get; init; } = string.Empty;

    [Required]
    [MinLength(1)]
    [JsonPropertyName("callbackUrl")]
    public string CallbackUrl { get; init; } = string.Empty;
}
