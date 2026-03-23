namespace SpotFinder.FeedService.Application.Features.Feed.Queries.Common;

public sealed record FeedResponse(
    IReadOnlyList<FeedPostDto> Posts,
    FeedCursor?                NextCursor,  // null when no more pages exist
    bool                       HasMore
);
