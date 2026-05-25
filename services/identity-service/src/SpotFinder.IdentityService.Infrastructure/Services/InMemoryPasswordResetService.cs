using System.Collections.Concurrent;
using SpotFinder.IdentityService.Domain.Services;

namespace SpotFinder.IdentityService.Infrastructure.Services;

/// <summary>
/// In-memory password reset code store. Codes expire after 15 minutes.
/// Suitable for single-instance deployments; replace with DB-backed store for multi-instance.
/// </summary>
public sealed class InMemoryPasswordResetService : IPasswordResetService
{
    private record Entry(string Code, DateTime ExpiresAt);

    private readonly ConcurrentDictionary<string, Entry> _store = new(StringComparer.OrdinalIgnoreCase);

    public string GenerateCode(string email)
    {
        var code = Random.Shared.Next(100_000, 999_999).ToString();
        _store[email] = new Entry(code, DateTime.UtcNow.AddMinutes(15));
        return code;
    }

    public bool ValidateCode(string email, string code)
    {
        if (!_store.TryGetValue(email, out var entry)) return false;
        if (DateTime.UtcNow > entry.ExpiresAt) { _store.TryRemove(email, out _); return false; }
        return string.Equals(entry.Code, code, StringComparison.Ordinal);
    }

    public void InvalidateCode(string email) => _store.TryRemove(email, out _);
}
