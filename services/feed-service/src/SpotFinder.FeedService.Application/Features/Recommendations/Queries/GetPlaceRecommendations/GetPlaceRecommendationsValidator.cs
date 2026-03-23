using FluentValidation;

namespace SpotFinder.FeedService.Application.Features.Recommendations.Queries.GetPlaceRecommendations;

public sealed class GetPlaceRecommendationsValidator : AbstractValidator<GetPlaceRecommendationsQuery>
{
    public GetPlaceRecommendationsValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.PageSize).InclusiveBetween(1, 50);
    }
}
