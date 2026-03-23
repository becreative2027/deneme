using FluentValidation;

namespace SpotFinder.AdminService.Application.Features.Labels.Commands.Assign;

public sealed class AdminAssignLabelToPlaceCommandValidator : AbstractValidator<AdminAssignLabelToPlaceCommand>
{
    public AdminAssignLabelToPlaceCommandValidator()
    {
        RuleFor(x => x.PlaceId).NotEmpty();
        RuleFor(x => x.LabelId).GreaterThan(0);
        // Weight 0–1 per spec (not 0–10).
        RuleFor(x => x.Weight)
            .InclusiveBetween(0m, 1m)
            .WithMessage("Weight must be between 0.00 and 1.00.");
    }
}
