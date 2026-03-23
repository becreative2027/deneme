using FluentValidation;

namespace SpotFinder.SearchService.Application.Features.Search.Queries.SearchPlaces;

public sealed class SearchPlacesQueryValidator : AbstractValidator<SearchPlacesQuery>
{
    public SearchPlacesQueryValidator()
    {
        RuleFor(x => x.Page).GreaterThan(0);
        RuleFor(x => x.PageSize).InclusiveBetween(1, 100);
        When(x => x.NearLatitude.HasValue || x.NearLongitude.HasValue, () =>
        {
            RuleFor(x => x.NearLatitude).NotNull().InclusiveBetween(-90, 90);
            RuleFor(x => x.NearLongitude).NotNull().InclusiveBetween(-180, 180);
        });
    }
}
