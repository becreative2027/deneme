using FluentValidation;

namespace SpotFinder.AdminService.Application.Features.Labels.Commands.Create;

public sealed class AdminCreateLabelCommandValidator : AbstractValidator<AdminCreateLabelCommand>
{
    public AdminCreateLabelCommandValidator()
    {
        RuleFor(x => x.CategoryId).GreaterThan(0);
        RuleFor(x => x.Key).NotEmpty().MaximumLength(100);

        RuleFor(x => x.Translations)
            .NotNull().WithMessage("At least one translation is required.")
            .Must(t => t != null && t.Count > 0).WithMessage("At least one translation is required.");

        RuleForEach(x => x.Translations).ChildRules(t =>
        {
            t.RuleFor(x => x.LanguageId).GreaterThan(0);
            t.RuleFor(x => x.DisplayName).NotEmpty().MaximumLength(200);
        });
    }
}
