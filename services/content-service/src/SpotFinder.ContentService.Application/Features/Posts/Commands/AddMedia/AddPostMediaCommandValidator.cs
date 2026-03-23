using FluentValidation;

namespace SpotFinder.ContentService.Application.Features.Posts.Commands.AddMedia;

public sealed class AddPostMediaCommandValidator : AbstractValidator<AddPostMediaCommand>
{
    public AddPostMediaCommandValidator()
    {
        RuleFor(x => x.PostId).NotEmpty();
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.Url).NotEmpty().MaximumLength(2048);
        When(x => x.Type != null, () =>
            RuleFor(x => x.Type!).MaximumLength(50));
    }
}
