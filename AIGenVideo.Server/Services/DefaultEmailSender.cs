using AIGenVideo.Server.Abstractions;

namespace AIGenVideo.Server.Services;

public class DefaultEmailSender : IEmailSender
{
    public Task SendEmailAsync(string email, string subject, string htmlMessage)
    {
        return Task.CompletedTask; // No-op implementation
    }
}
