using System.Text.Json.Serialization;

namespace AIGenVideo.Server.Models.RequestModels;

public class PaymentRequest
{
    [JsonPropertyName("email")]
    public string Email { get; set; } = string.Empty;
    [JsonPropertyName("provider")]
    public string Provider { get; set; } = string.Empty;
    [JsonPropertyName("duration")]
    public int DurationMonths { get; set; } = 1;
    [JsonPropertyName("returnUrl")]
    public string ReturnUrl { get; set; } = string.Empty;
}
