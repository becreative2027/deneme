using SpotFinder.BuildingBlocks.Domain;
using SpotFinder.IdentityService.Domain.Enums;
using SpotFinder.IdentityService.Domain.Events;

namespace SpotFinder.IdentityService.Domain.Entities;

public sealed class User : AggregateRoot<Guid>
{
    public string Email { get; private set; } = string.Empty;
    public string Username { get; private set; } = string.Empty;
    public string PasswordHash { get; private set; } = string.Empty;
    public UserRole Role { get; private set; } = UserRole.User;
    public bool IsActive { get; private set; } = true;
    public bool IsEmailVerified { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    private User() { }

    public static User Create(Guid id, string email, string username, string passwordHash)
    {
        var user = new User
        {
            Id = id,
            Email = email.ToLowerInvariant(),
            Username = username,
            PasswordHash = passwordHash,
            CreatedAt = DateTime.UtcNow
        };
        user.AddDomainEvent(new UserCreatedDomainEvent(id, email, username));
        return user;
    }

    public void UpdateEmail(string email)
    {
        Email = email.ToLowerInvariant();
        UpdatedAt = DateTime.UtcNow;
    }

    public void SetRole(UserRole role)
    {
        Role = role;
        UpdatedAt = DateTime.UtcNow;
    }

    public void Deactivate()
    {
        IsActive = false;
        UpdatedAt = DateTime.UtcNow;
    }

    public void VerifyEmail()
    {
        IsEmailVerified = true;
        UpdatedAt = DateTime.UtcNow;
    }
}
