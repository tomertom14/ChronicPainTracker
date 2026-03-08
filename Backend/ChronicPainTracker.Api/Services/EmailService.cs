using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;

namespace ChronicPainTracker.Api.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;

    public EmailService(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        var smtpUser = _configuration["Brevo:SmtpUser"];
        var smtpPass = _configuration["Brevo:SmtpPass"];

        // Failsafe: Check if configuration is actually loaded
        if (string.IsNullOrEmpty(smtpUser) || string.IsNullOrEmpty(smtpPass))
        {
            throw new Exception("SMTP credentials are missing. Please check your appsettings.Development.json file.");
        }

        var email = new MimeMessage();

        // IMPORTANT: Replace with your actual verified Brevo email
        email.From.Add(new MailboxAddress("Chronic Pain Tracker", "tomertom14@gmail.com"));
        email.To.Add(MailboxAddress.Parse(to));
        email.Subject = subject;

        var builder = new BodyBuilder { HtmlBody = body };
        email.Body = builder.ToMessageBody();

        using var smtp = new SmtpClient();

        try
        {
            // Connect using STARTTLS on port 587
            await smtp.ConnectAsync("smtp-relay.brevo.com", 587, SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(smtpUser, smtpPass);
            await smtp.SendAsync(email);
        }
        finally
        {
            await smtp.DisconnectAsync(true);
        }
    }
}