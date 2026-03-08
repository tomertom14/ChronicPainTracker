using System.Net.Http.Json;

namespace ChronicPainTracker.Api.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly HttpClient _httpClient;

    public EmailService(IConfiguration configuration, HttpClient httpClient)
    {
        _configuration = configuration;
        _httpClient = httpClient;
    }

    public async Task SendEmailAsync(string to, string subject, string body)
    {
        var apiKey = _configuration["Brevo:ApiKey"];

        if (string.IsNullOrEmpty(apiKey))
        {
            throw new Exception("Brevo API key is missing.");
        }

        _httpClient.DefaultRequestHeaders.Clear();
        _httpClient.DefaultRequestHeaders.Add("api-key", apiKey);

        var payload = new
        {
            sender = new { name = "Chronic Pain Tracker", email = "tomertom14@gmail.com" },
            to = new[] { new { email = to } },
            subject = subject,
            htmlContent = body
        };

        var response = await _httpClient.PostAsJsonAsync("https://api.brevo.com/v3/smtp/email", payload);

        if (!response.IsSuccessStatusCode)
        {
            var error = await response.Content.ReadAsStringAsync();
            throw new Exception($"Brevo API Error: {error}");
        }
    }
}