using FluentValidation;

namespace SpotFinder.ContentService.Application.Features.Posts.Commands.Create;

public sealed class CreatePostCommandValidator : AbstractValidator<CreatePostCommand>
{
    public CreatePostCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.PlaceId).NotEmpty().WithMessage("place_id is required. Every post must be tagged to a place.");
        When(x => x.Caption != null, () =>
            RuleFor(x => x.Caption!).MaximumLength(2000)
                .WithMessage("Caption must be at most 2000 characters."));
    }
}
