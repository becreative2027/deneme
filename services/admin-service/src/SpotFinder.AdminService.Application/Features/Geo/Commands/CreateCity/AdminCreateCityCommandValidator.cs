using FluentValidation;

namespace SpotFinder.AdminService.Application.Features.Geo.Commands.CreateCity;

public sealed class AdminCreateCityCommandValidator : AbstractValidator<AdminCreateCityCommand>
{
    public AdminCreateCityCommandValidator()
    {
        RuleFor(x => x.CountryId).GreaterThan(0);

        RuleFor(x => x.Translations)
            .NotNull().WithMessage("At least one translation is required.")
            .Must(t => t != null && t.Count > 0).WithMessage("At least one translation is required.");

        RuleForEach(x => x.Translations).ChildRules(t =>
        {
            t.RuleFor(x => x.LanguageId).GreaterThan(0);
            t.RuleFor(x => x.Name).NotEmpty().MaximumLength(200);
            t.RuleFor(x => x.Slug!).MaximumLength(200).When(x => x.Slug != null);
        });
    }
}
