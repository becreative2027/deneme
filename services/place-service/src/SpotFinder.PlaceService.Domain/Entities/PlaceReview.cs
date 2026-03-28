using SpotFinder.BuildingBlocks.Domain;

namespace SpotFinder.PlaceService.Domain.Entities;

public sealed class PlaceReview : Entity<Guid>
{
    public Guid PlaceId { get; private set; }
    public Guid UserId { get; private set; }
    public string Username { get; private set; } = string.Empty;
    public string DisplayName { get; private set; } = string.Empty;
    public string? AvatarUrl { get; private set; }
    public int Rating { get; private set; }
    public string? Comment { get; private set; }
    public DateTime CreatedAt { get; private set; }
    public DateTime? UpdatedAt { get; private set; }

    private PlaceReview() { }

    public static PlaceReview Create(
        Guid placeId, Guid userId, string username, string displayName,
        string? avatarUrl, int rating, string? comment)
        => new()
        {
            Id = Guid.NewGuid(),
            PlaceId = placeId,
            UserId = userId,
            Username = username,
            DisplayName = displayName,
            AvatarUrl = avatarUrl,
            Rating = Math.Clamp(rating, 1, 5),
            Comment = comment,
            CreatedAt = DateTime.UtcNow,
        };

    public void Update(int rating, string? comment, string displayName, string? avatarUrl)
    {
        Rating = Math.Clamp(rating, 1, 5);
        Comment = comment;
        DisplayName = displayName;
        AvatarUrl = avatarUrl;
        UpdatedAt = DateTime.UtcNow;
    }
}
