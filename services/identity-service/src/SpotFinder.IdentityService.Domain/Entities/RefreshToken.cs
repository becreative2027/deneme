using SpotFinder.BuildingBlocks.Domain;

namespace SpotFinder.IdentityService.Domain.Entities;

public sealed class RefreshToken : Entity<Guid>
{
    public Guid UserId { get; private set; }
    public string Token { get; private set; } = string.Empty;
    public DateTime ExpiresAt { get; private set; }
    public bool IsRevoked { get; private set; }
    public DateTime CreatedAt { get; private set; }

    private RefreshToken() { }

    public static RefreshToken Create(Guid userId, string token, DateTime expiresAt)
        => new() { Id = Guid.NewGuid(), UserId = userId, Token = token, ExpiresAt = expiresAt, CreatedAt = DateTime.UtcNow };

    public void Revoke() => IsRevoked = true;
    public bool IsExpired => DateTime.UtcNow >= ExpiresAt;
    public bool IsActive => !IsRevoked && !IsExpired;
}
