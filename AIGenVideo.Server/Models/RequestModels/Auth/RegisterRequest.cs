using System.ComponentModel.DataAnnotations;

namespace AIGenVideo.Server.Models.RequestModels.Auth;

public class RegisterRequest
{
    [Required]
    public string Email { get; set; } = string.Empty;
    [Required]
    public string Password { get; set; } = string.Empty;
}
