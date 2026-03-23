using FluentValidation;

namespace SpotFinder.AdminService.Application.Features.Labels.Commands.Update;

public sealed class AdminUpdateLabelCommandValidator : AbstractValidator<AdminUpdateLabelCommand>
{
    public AdminUpdateLabelCommandValidator()
    {
        RuleFor(x => x.LabelId).GreaterThan(0);

        When(x => x.Key != null, () =>
            RuleFor(x => x.Key!).NotEmpty().MaximumLength(100));
    }
}
