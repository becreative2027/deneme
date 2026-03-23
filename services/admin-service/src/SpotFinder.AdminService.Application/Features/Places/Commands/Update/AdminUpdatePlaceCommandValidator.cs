using FluentValidation;

namespace SpotFinder.AdminService.Application.Features.Places.Commands.Update;

public sealed class AdminUpdatePlaceCommandValidator : AbstractValidator<AdminUpdatePlaceCommand>
{
    private static readonly string[] ValidParkingStatuses = ["available", "unavailable", "limited"];

    public AdminUpdatePlaceCommandValidator()
    {
        RuleFor(x => x.PlaceId).NotEmpty();

        When(x => x.Latitude.HasValue, () =>
            RuleFor(x => x.Latitude!.Value)
                .InclusiveBetween(-90, 90)
                .WithMessage("Latitude must be between -90 and 90."));

        When(x => x.Longitude.HasValue, () =>
            RuleFor(x => x.Longitude!.Value)
                .InclusiveBetween(-180, 180)
                .WithMessage("Longitude must be between -180 and 180."));

        When(x => x.Rating.HasValue, () =>
            RuleFor(x => x.Rating!.Value)
                .InclusiveBetween(0m, 5m)
                .WithMessage("Rating must be between 0 and 5."));

        When(x => x.ParkingStatus != null, () =>
            RuleFor(x => x.ParkingStatus!)
                .Must(s => ValidParkingStatuses.Contains(s))
                .WithMessage("ParkingStatus must be 'available', 'unavailable', or 'limited'."));
    }
}
