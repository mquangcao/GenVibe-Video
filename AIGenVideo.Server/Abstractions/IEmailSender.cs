namespace AIGenVideo.Server.Abstractions;

public interface IEmailSender
{
    public Task SendEmailAsync(string email, string subject, string htmlMessage);
}
