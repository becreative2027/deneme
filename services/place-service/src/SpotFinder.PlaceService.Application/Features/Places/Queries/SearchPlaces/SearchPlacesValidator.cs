using FluentValidation;

namespace SpotFinder.PlaceService.Application.Features.Places.Queries.SearchPlaces;

public sealed class SearchPlacesValidator : AbstractValidator<SearchPlacesQuery>
{
    public SearchPlacesValidator()
    {
        RuleFor(x => x.LanguageId)
            .GreaterThan(0).WithMessage("LanguageId must be a positive integer.");

        RuleFor(x => x.Page)
            .GreaterThan(0).WithMessage("Page must be >= 1.");

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100).WithMessage("PageSize must be between 1 and 100.");

        When(x => x.MinRating.HasValue, () =>
            RuleFor(x => x.MinRating!.Value)
                .InclusiveBetween(0, 5).WithMessage("MinRating must be between 0 and 5."));

        RuleFor(x => x.MatchMode)
            .Must(m => m == "ANY" || m == "ALL")
            .WithMessage("MatchMode must be 'ANY' or 'ALL'.");

        When(x => x.LabelIds is { Count: > 0 }, () =>
            RuleForEach(x => x.LabelIds)
                .GreaterThan(0).WithMessage("Each LabelId must be a positive integer."));
    }
}
