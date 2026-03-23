using FluentValidation;

namespace SpotFinder.FeedService.Application.Features.Feed.Queries.GetPersonalizedFeed;

public sealed class GetPersonalizedFeedValidator : AbstractValidator<GetPersonalizedFeedQuery>
{
    public GetPersonalizedFeedValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.PageSize).InclusiveBetween(1, 50);

        RuleFor(x => x)
            .Must(x => CursorIsComplete(x) || CursorIsAbsent(x))
            .WithMessage("Cursor requires all three fields: cursorScore, cursorCreatedAt, cursorPostId.")
            .When(x => x.CursorScore.HasValue
                    || x.CursorCreatedAt.HasValue
                    || x.CursorPostId.HasValue);

        RuleFor(x => x.CursorScore)
            .GreaterThanOrEqualTo(0)
            .When(x => x.CursorScore.HasValue);
    }

    private static bool CursorIsComplete(GetPersonalizedFeedQuery x)
        => x.CursorScore.HasValue && x.CursorCreatedAt.HasValue && x.CursorPostId.HasValue;

    private static bool CursorIsAbsent(GetPersonalizedFeedQuery x)
        => !x.CursorScore.HasValue && !x.CursorCreatedAt.HasValue && !x.CursorPostId.HasValue;
}
