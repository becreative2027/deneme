using System.IdentityModel.Tokens.Jwt;
using System.Net.Http.Json;
using System.Security.Claims;
using System.Text.Json.Serialization;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using SpotFinder.BuildingBlocks.Application;
using SpotFinder.IdentityService.Application.Features.Auth.Commands.Login;
using SpotFinder.IdentityService.Domain.Entities;
using SpotFinder.IdentityService.Domain.Repositories;
using SpotFinder.IdentityService.Domain.Services;
using RefreshTokenEntity = SpotFinder.IdentityService.Domain.Entities.RefreshToken;

namespace SpotFinder.IdentityService.Application.Features.Auth.Commands.OAuthLogin;

public sealed class OAuthLoginCommandHandler : ICommandHandler<OAuthLoginCommand, LoginResult>
{
    private readonly IUserRepository _userRepository;
    private readonly IRefreshTokenRepository _refreshTokenRepository;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IHttpClientFactory _httpClientFactory;

    // Apple OIDC discovery
    private const string AppleDiscoveryUrl = "https://appleid.apple.com/.well-known/openid-configuration";
    private const string AppleAudience     = "com.ayberkkemal.spotfinder";

    // Google tokeninfo endpoint
    private const string GoogleTokenInfoUrl = "https://oauth2.googleapis.com/tokeninfo";

    public OAuthLoginCommandHandler(
        IUserRepository userRepository,
        IRefreshTokenRepository refreshTokenRepository,
        IJwtTokenService jwtTokenService,
        IUnitOfWork unitOfWork,
        IHttpClientFactory httpClientFactory)
    {
        _userRepository       = userRepository;
        _refreshTokenRepository = refreshTokenRepository;
        _jwtTokenService      = jwtTokenService;
        _unitOfWork           = unitOfWork;
        _httpClientFactory    = httpClientFactory;
    }

    public async Task<LoginResult> Handle(OAuthLoginCommand request, CancellationToken ct)
    {
        var provider = request.Provider.ToLowerInvariant();

        var (externalId, email) = provider switch
        {
            "apple"  => await VerifyAppleTokenAsync(request.IdentityToken, ct),
            "google" => await VerifyGoogleTokenAsync(request.IdentityToken, ct),
            _        => throw new InvalidOperationException($"Unsupported provider: {provider}")
        };

        // Email override from client (Apple only sends email on first sign-in)
        email ??= request.Email
            ?? throw new InvalidOperationException("Email could not be determined from token.");

        // ── Find or create user ───────────────────────────────────────────────
        var user = await _userRepository.GetByExternalIdAsync(provider, externalId, ct)
                ?? await _userRepository.GetByEmailAsync(email, ct);

        if (user is null)
        {
            var username = await GenerateUniqueUsernameAsync(request.DisplayName, email, ct);
            user = User.CreateFromOAuth(Guid.NewGuid(), email, username, provider, externalId);
            await _userRepository.AddAsync(user, ct);
        }

        if (!user.IsActive)
            throw new UnauthorizedAccessException("Account is deactivated.");

        // ── Issue tokens ──────────────────────────────────────────────────────
        var accessToken      = _jwtTokenService.GenerateAccessToken(user);
        var refreshTokenValue = _jwtTokenService.GenerateRefreshToken();
        var refreshToken     = RefreshTokenEntity.Create(user.Id, refreshTokenValue, DateTime.UtcNow.AddDays(30));

        await _refreshTokenRepository.AddAsync(refreshToken, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        return new LoginResult(accessToken, refreshTokenValue, user.Id);
    }

    // ── Apple ─────────────────────────────────────────────────────────────────
    private async Task<(string ExternalId, string? Email)> VerifyAppleTokenAsync(
        string identityToken, CancellationToken ct)
    {
        var configManager = new ConfigurationManager<OpenIdConnectConfiguration>(
            AppleDiscoveryUrl,
            new OpenIdConnectConfigurationRetriever(),
            new HttpDocumentRetriever());

        var config = await configManager.GetConfigurationAsync(ct);

        var handler = new JwtSecurityTokenHandler();
        var validationParams = new TokenValidationParameters
        {
            ValidateIssuer           = true,
            ValidIssuer              = "https://appleid.apple.com",
            ValidateAudience         = true,
            ValidAudience            = AppleAudience,
            ValidateLifetime         = true,
            IssuerSigningKeys        = config.SigningKeys,
            ValidateIssuerSigningKey = true,
        };

        ClaimsPrincipal principal;
        try
        {
            principal = handler.ValidateToken(identityToken, validationParams, out _);
        }
        catch (Exception ex)
        {
            throw new UnauthorizedAccessException($"Apple token validation failed: {ex.Message}");
        }

        var sub   = principal.FindFirst(ClaimTypes.NameIdentifier)?.Value
                 ?? principal.FindFirst("sub")?.Value
                 ?? throw new UnauthorizedAccessException("Apple token missing 'sub' claim.");
        var email = principal.FindFirst(ClaimTypes.Email)?.Value
                 ?? principal.FindFirst("email")?.Value;

        return (sub, email);
    }

    // ── Google ────────────────────────────────────────────────────────────────
    private async Task<(string ExternalId, string? Email)> VerifyGoogleTokenAsync(
        string idToken, CancellationToken ct)
    {
        var http     = _httpClientFactory.CreateClient();
        var response = await http.GetAsync($"{GoogleTokenInfoUrl}?id_token={idToken}", ct);

        if (!response.IsSuccessStatusCode)
            throw new UnauthorizedAccessException("Google token validation failed.");

        var info = await response.Content.ReadFromJsonAsync<GoogleTokenInfo>(ct)
            ?? throw new UnauthorizedAccessException("Google token info was empty.");

        if (string.IsNullOrEmpty(info.Sub))
            throw new UnauthorizedAccessException("Google token missing 'sub'.");

        return (info.Sub, info.Email);
    }

    // ── Username generation ────────────────────────────────────────────────────
    private async Task<string> GenerateUniqueUsernameAsync(
        string? displayName, string email, CancellationToken ct)
    {
        // Base: lowercase first part of display name or email prefix
        var baseUsername = (displayName ?? email.Split('@')[0])
            .ToLowerInvariant()
            .Replace(" ", "_")
            .Replace("-", "_");

        // Keep only alphanumeric + underscore, max 20 chars
        baseUsername = new string(
            baseUsername.Where(c => char.IsLetterOrDigit(c) || c == '_').ToArray());
        if (baseUsername.Length > 20) baseUsername = baseUsername[..20];
        if (baseUsername.Length < 3)  baseUsername = "user";

        var candidate = baseUsername;
        var suffix    = 1;

        while (await _userRepository.ExistsByUsernameAsync(candidate, ct))
            candidate = $"{baseUsername}{suffix++}";

        return candidate;
    }

    private sealed class GoogleTokenInfo
    {
        [JsonPropertyName("sub")]   public string? Sub   { get; init; }
        [JsonPropertyName("email")] public string? Email { get; init; }
    }
}
