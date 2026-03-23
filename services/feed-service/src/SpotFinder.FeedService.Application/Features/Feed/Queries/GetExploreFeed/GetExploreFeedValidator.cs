using FluentValidation;

namespace SpotFinder.FeedService.Application.Features.Feed.Queries.GetExploreFeed;

public sealed class GetExploreFeedValidator : AbstractValidator<GetExploreFeedQuery>
{
    public GetExploreFeedValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.PageSize).InclusiveBetween(1, 50);
    }
}
