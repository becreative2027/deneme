using FluentValidation;

namespace SpotFinder.PlaceService.Application.Features.Places.Queries.GetPlaceDetail;

public sealed class GetPlaceDetailValidator : AbstractValidator<GetPlaceDetailQuery>
{
    public GetPlaceDetailValidator()
    {
        RuleFor(x => x.PlaceId)
            .NotEmpty().WithMessage("PlaceId is required.");

        RuleFor(x => x.LanguageId)
            .GreaterThan(0).WithMessage("LanguageId must be a positive integer.");
    }
}
