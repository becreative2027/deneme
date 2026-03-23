using FluentValidation;

namespace SpotFinder.ContentService.Application.Features.Posts.Commands.Comment;

public sealed class CommentPostCommandValidator : AbstractValidator<CommentPostCommand>
{
    public CommentPostCommandValidator()
    {
        RuleFor(x => x.UserId).NotEmpty();
        RuleFor(x => x.PostId).NotEmpty();
        RuleFor(x => x.Text).NotEmpty().MaximumLength(2000)
            .WithMessage("Comment must be between 1 and 2000 characters.");
    }
}
