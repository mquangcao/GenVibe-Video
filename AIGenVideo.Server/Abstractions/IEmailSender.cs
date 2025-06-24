using AIGenVideo.Server.Models.DomainModels;

namespace AIGenVideo.Server.Abstractions;

public interface IEmailSender
{
    public Task<SendEmailResult> SendEmailAsync(string toEmail, string subject, string htmlBody);
    public Task<SendEmailResult> SendResetPasswordEmailAsync(string toEmail, string resetLink);
}
