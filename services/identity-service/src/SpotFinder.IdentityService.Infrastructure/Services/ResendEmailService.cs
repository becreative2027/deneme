using System.Net.Http.Json;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SpotFinder.IdentityService.Domain.Services;

namespace SpotFinder.IdentityService.Infrastructure.Services;

public sealed class ResendEmailService : IEmailService
{
    private readonly HttpClient _http;
    private readonly ILogger<ResendEmailService> _logger;
    private const string FromAddress = "noreply@sptfinder.com";

    public ResendEmailService(HttpClient http, IConfiguration configuration, ILogger<ResendEmailService> logger)
    {
        _http = http;
        _logger = logger;

        var apiKey = configuration["Resend:ApiKey"]
            ?? throw new InvalidOperationException("Resend:ApiKey is not configured.");
        _http.DefaultRequestHeaders.Authorization =
            new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", apiKey);
    }

    public async Task SendPasswordResetCodeAsync(string toEmail, string code, CancellationToken cancellationToken = default)
    {
        var payload = new
        {
            from = $"SpotFinder <{FromAddress}>",
            to = new[] { toEmail },
            subject = "Şifre Sıfırlama Kodun",
            html = $"""
                <div style="font-family:sans-serif;max-width:480px;margin:auto;padding:32px;">
                  <h2 style="color:#f59e0b;">SpotFinder</h2>
                  <p>Merhaba,</p>
                  <p>Şifre sıfırlama kodun:</p>
                  <div style="font-size:36px;font-weight:bold;letter-spacing:8px;text-align:center;
                              padding:24px;background:#1c1c1e;color:#f59e0b;border-radius:12px;margin:24px 0;">
                    {code}
                  </div>
                  <p style="color:#6b7280;font-size:14px;">Bu kod 15 dakika geçerlidir. Eğer şifre sıfırlama talebinde bulunmadıysan bu maili görmezden gelebilirsin.</p>
                </div>
                """
        };

        var response = await _http.PostAsJsonAsync("https://api.resend.com/emails", payload, cancellationToken);

        if (!response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadAsStringAsync(cancellationToken);
            _logger.LogError("Resend API error {Status}: {Body}", response.StatusCode, body);
            throw new InvalidOperationException("E-posta gönderilemedi.");
        }

        _logger.LogInformation("Password reset email sent to {Email}", toEmail);
    }
}
