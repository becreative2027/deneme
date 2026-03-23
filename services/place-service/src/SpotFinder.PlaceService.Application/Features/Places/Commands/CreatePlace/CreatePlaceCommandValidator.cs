using FluentValidation;

namespace SpotFinder.PlaceService.Application.Features.Places.Commands.CreatePlace;

public sealed class CreatePlaceCommandValidator : AbstractValidator<CreatePlaceCommand>
{
    public CreatePlaceCommandValidator()
    {
        RuleFor(x => x.Name).NotEmpty().MaximumLength(300);
        RuleFor(x => x.LanguageId).GreaterThan(0);
        When(x => x.Latitude.HasValue, () => RuleFor(x => x.Latitude!.Value).InclusiveBetween(-90, 90));
        When(x => x.Longitude.HasValue, () => RuleFor(x => x.Longitude!.Value).InclusiveBetween(-180, 180));
    }
}
