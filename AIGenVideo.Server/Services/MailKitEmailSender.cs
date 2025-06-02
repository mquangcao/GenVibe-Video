using AIGenVideo.Server.Models.Configurations;
using AIGenVideo.Server.Models.DomainModels;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
namespace AIGenVideo.Server.Services;

public class MailKitEmailSender(IOptions<EmailOptions> options) : IEmailSender
{
    private readonly EmailOptions _options = options.Value;
    public async Task<SendEmailResult> SendEmailAsync(string toEmail, string subject, string htmlBody)
    {
        if (string.IsNullOrEmpty(toEmail))
        {
            return new SendEmailResult(false, "Recipient email address is required.");
        }

        try
        {
            var email = new MimeMessage();
            email.From.Add(new MailboxAddress(_options.SenderName, _options.SenderEmail));
            email.To.Add(MailboxAddress.Parse(toEmail));
            email.Subject = subject;

            email.Body = new TextPart(MimeKit.Text.TextFormat.Html) { Text = htmlBody };
            using var smtp = new SmtpClient();
            await smtp.ConnectAsync(_options.SmtpServer, _options.SmtpPort, SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(_options.SenderEmail, _options.Password);
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);
        }
        catch (ParseException e)
        {
            return new SendEmailResult(false, $"Invalid email address format: {e.Message}");
        }
        catch (SmtpCommandException e)
        {
            return new SendEmailResult(false, $"SMTP command error: {e.Message}");
        }
        catch (SmtpProtocolException e)
        {
            return new SendEmailResult(false, $"SMTP protocol error: {e.Message}");
        }
        catch (Exception e)
        {
            return new SendEmailResult(false, $"An error occurred while sending the email: {e.Message}");
        }

        return new SendEmailResult(true, "Email sent successfully.");
    }


    public Task<SendEmailResult> SendResetPasswordEmailAsync(string toEmail, string resetLink)
    {
        var body = $"Click the link to reset your password: <a href='{resetLink}'>Reset Password</a>";
        return SendEmailAsync(toEmail, "[AI_Gen_Video] Reset your password", body);
    }
}
