using FluentValidation;

namespace SpotFinder.IdentityService.Application.Features.Users.Commands.UpdateProfile;

public sealed class UpdateProfileCommandValidator : AbstractValidator<UpdateProfileCommand>
{
    public UpdateProfileCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();

        When(x => x.DisplayName != null, () =>
            RuleFor(x => x.DisplayName!).MaximumLength(100)
                .WithMessage("DisplayName must be at most 100 characters."));

        When(x => x.Bio != null, () =>
            RuleFor(x => x.Bio!).MaximumLength(500)
                .WithMessage("Bio must be at most 500 characters."));

        When(x => x.ProfileImageUrl != null, () =>
            RuleFor(x => x.ProfileImageUrl!).MaximumLength(2048)
                .WithMessage("ProfileImageUrl must be at most 2048 characters."));
    }
}
