using FluentValidation;

namespace SpotFinder.SocialGraphService.Application.Features.Social.Commands.Follow;

public sealed class FollowUserCommandValidator : AbstractValidator<FollowUserCommand>
{
    public FollowUserCommandValidator()
    {
        RuleFor(x => x.FollowerId).NotEmpty();
        RuleFor(x => x.FollowingId).NotEmpty();
        RuleFor(x => x).Must(x => x.FollowerId != x.FollowingId)
            .WithMessage("You cannot follow yourself.");
    }
}
