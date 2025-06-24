namespace AIGenVideo.Server.Models.ResponseModels.Auth;

public sealed record ForgotPasswordResponse
{
    public string Email { get; init; } = string.Empty;
    
}
