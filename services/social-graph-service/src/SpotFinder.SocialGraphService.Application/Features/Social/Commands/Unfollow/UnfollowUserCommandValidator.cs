using FluentValidation;

namespace SpotFinder.SocialGraphService.Application.Features.Social.Commands.Unfollow;

public sealed class UnfollowUserCommandValidator : AbstractValidator<UnfollowUserCommand>
{
    public UnfollowUserCommandValidator()
    {
        RuleFor(x => x.FollowerId).NotEmpty();
        RuleFor(x => x.FollowingId).NotEmpty();
    }
}
