using MediatR;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.FeedService.Application.Features.Feed.Queries.Common;

namespace SpotFinder.FeedService.Application.Features.Feed.Queries.GetPersonalizedFeed;

/// <summary>
/// Returns a cursor-paginated, personalized feed ranked by:
///   final_score = feed_score + (user_interest_score × 2) + trend_score
///
/// User interest score is the sum of the user's interest weights for all labels
/// attached to the post's place. trend_score comes from content.trending_scores.
///
/// Cursor uses feed_score as a DB-friendly proxy (final_score is user-specific
/// and cannot be indexed). Re-ranking happens in memory after the DB fetch.
///
/// Falls back to global top posts if the user has no recorded interests yet.
/// </summary>
public sealed record GetPersonalizedFeedQuery(
    Guid      UserId,
    int       PageSize,
    int?      CursorScore,
    DateTime? CursorCreatedAt,
    Guid?     CursorPostId
) : IRequest<ApiResult<FeedResponse>>;
