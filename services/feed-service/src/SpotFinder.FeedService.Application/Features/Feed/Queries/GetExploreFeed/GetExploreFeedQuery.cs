using MediatR;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.FeedService.Application.Features.Feed.Queries.Common;

namespace SpotFinder.FeedService.Application.Features.Feed.Queries.GetExploreFeed;

/// <summary>
/// Explore feed — combines trending, personalized, and fallback sources
/// into a single ranked, deduplicated result set.
///
/// No cursor — always returns the freshest blend (cached 30 s per user).
/// </summary>
public sealed record GetExploreFeedQuery(
    Guid UserId,
    int  PageSize
) : IRequest<ApiResult<FeedResponse>>;
