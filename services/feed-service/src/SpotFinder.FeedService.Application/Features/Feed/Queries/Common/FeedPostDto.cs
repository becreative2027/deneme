namespace SpotFinder.FeedService.Application.Features.Feed.Queries.Common;

/// <summary>Mobile-optimised feed post projection.</summary>
public sealed record FeedPostDto(
    Guid                  Id,
    FeedUserDto           User,
    FeedPlaceDto          Place,
    string?               Caption,
    IReadOnlyList<string> Media,
    int                   LikeCount,
    int                   CommentCount,
    DateTime              CreatedAt,
    bool                  IsLiked
);

public sealed record FeedUserDto(
    Guid    Id,
    string  Username,
    string? DisplayName,
    string? ProfileImageUrl
);

public sealed record FeedPlaceDto(Guid Id, string Name);
