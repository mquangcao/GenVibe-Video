using System.Text.Json.Serialization;

namespace AIGenVideo.Server.Models.ResponseModels;

public class CheckOutResponse
{
    [JsonPropertyName("name")]
    public string Name { get; set; } = string.Empty;
    [JsonPropertyName("price")]
    public decimal Price { get; set; }
    [JsonPropertyName("savings")]
    public decimal Discount { get; set; }
    [JsonPropertyName("duration")]
    public string Duration { get; set; } = string.Empty;

    [JsonPropertyName("durationMonths")]
    public int DurationMonths { get; set; }
    public DateTime NextBillingDate { get; set; }
}
