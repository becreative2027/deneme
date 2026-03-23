using FluentValidation;

namespace SpotFinder.FeedService.Application.Features.Feed.Queries.GetFollowingFeed;

public sealed class GetFollowingFeedValidator : AbstractValidator<GetFollowingFeedQuery>
{
    public GetFollowingFeedValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.PageSize).InclusiveBetween(1, 50);

        // Cursor: either ALL three fields are provided, or NONE
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

    private static bool CursorIsComplete(GetFollowingFeedQuery x)
        => x.CursorScore.HasValue && x.CursorCreatedAt.HasValue && x.CursorPostId.HasValue;

    private static bool CursorIsAbsent(GetFollowingFeedQuery x)
        => !x.CursorScore.HasValue && !x.CursorCreatedAt.HasValue && !x.CursorPostId.HasValue;
}
