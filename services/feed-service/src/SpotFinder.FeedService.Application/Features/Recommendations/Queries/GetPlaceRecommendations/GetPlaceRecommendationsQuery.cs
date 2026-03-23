using MediatR;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.FeedService.Application.Features.Recommendations.Dtos;

namespace SpotFinder.FeedService.Application.Features.Recommendations.Queries.GetPlaceRecommendations;

/// <summary>
/// Returns the top places ranked by the user's interest + trending score.
///
/// total_score = SUM(user_interest_score × label_weight) + trend_score
///
/// Falls back to trending places when the user has no interests.
/// </summary>
public sealed record GetPlaceRecommendationsQuery(
    Guid UserId,
    int  PageSize
) : IRequest<ApiResult<PlaceRecommendationResponse>>;
