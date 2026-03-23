using FluentValidation;

namespace SpotFinder.AdminService.Application.Features.Places.Commands.Create;

public sealed class AdminCreatePlaceCommandValidator : AbstractValidator<AdminCreatePlaceCommand>
{
    private static readonly string[] ValidParkingStatuses = ["available", "unavailable", "limited"];

    public AdminCreatePlaceCommandValidator()
    {
        RuleFor(x => x.Translations)
            .NotNull().WithMessage("At least one translation is required.")
            .Must(t => t != null && t.Count > 0).WithMessage("At least one translation is required.");

        RuleForEach(x => x.Translations).ChildRules(t =>
        {
            t.RuleFor(x => x.LanguageId).GreaterThan(0);
            t.RuleFor(x => x.Name).NotEmpty().MaximumLength(300);
            // Slug: if provided must be max 300 chars and no leading/trailing spaces
            // (normalisation to lowercase/dashes happens in the handler)
            t.RuleFor(x => x.Slug!).MaximumLength(300).When(x => x.Slug != null);
        });

        When(x => x.Latitude.HasValue, () =>
            RuleFor(x => x.Latitude!.Value)
                .InclusiveBetween(-90, 90)
                .WithMessage("Latitude must be between -90 and 90."));

        When(x => x.Longitude.HasValue, () =>
            RuleFor(x => x.Longitude!.Value)
                .InclusiveBetween(-180, 180)
                .WithMessage("Longitude must be between -180 and 180."));

        RuleFor(x => x.ParkingStatus)
            .Must(s => ValidParkingStatuses.Contains(s))
            .WithMessage("ParkingStatus must be 'available', 'unavailable', or 'limited'.");
    }
}
