using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace AIGenVideo.Server.Models.RequestModels.Admin;

public class CreateUserRequest : RegisterRequest
{
    /// <summary>
    /// The role of the user to be created.
    /// </summary>
    [Required]
    [JsonPropertyName("role")]
    public string Role { get; set; } = "user";

    /// <summary>
    /// The expiration date for VIP status, if applicable.
    /// </summary>
    [JsonPropertyName("toDate")]
    public DateTime? VipExpires { get; set; } = null;
}
