using FluentValidation;

namespace SpotFinder.ContentService.Application.Features.Posts.Commands.Moderate;

public sealed class ModeratePostCommandValidator : AbstractValidator<ModeratePostCommand>
{
    private static readonly string[] ValidStatuses = ["active", "hidden", "flagged"];

    public ModeratePostCommandValidator()
    {
        RuleFor(x => x.PostId).NotEmpty();
        RuleFor(x => x.Status)
            .NotEmpty()
            .Must(s => ValidStatuses.Contains(s))
            .WithMessage("Status must be 'active', 'hidden', or 'flagged'.");
        RuleFor(x => x.HiddenReason)
            .MaximumLength(500)
            .When(x => x.HiddenReason is not null);
    }
}
