namespace AIGenVideo.Server.Models.DomainModels;

public class UpdatePaymentResult
{
    public bool IsSuccess { get; set; }
    public string? Message { get; set; } = string.Empty;
    public string? PackageId { get; set; } = string.Empty;
    public string? ReturnUrl { get; set; } = string.Empty;
    public string? UserId { get; set; } = string.Empty;
}
