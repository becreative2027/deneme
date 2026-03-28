using MediatR;
using SpotFinder.AdminService.Domain.Entities;
using SpotFinder.AdminService.Domain.Repositories;
using SpotFinder.AdminService.Infrastructure.Persistence;

namespace SpotFinder.AdminService.Application.Features.Feedback.Commands.SubmitFeedback;

public sealed class SubmitFeedbackCommandHandler : IRequestHandler<SubmitFeedbackCommand, Guid>
{
    private readonly IFeedbackRepository _repo;
    private readonly AdminDbContext      _db;

    public SubmitFeedbackCommandHandler(IFeedbackRepository repo, AdminDbContext db)
    {
        _repo = repo;
        _db   = db;
    }

    public async Task<Guid> Handle(SubmitFeedbackCommand request, CancellationToken cancellationToken)
    {
        var item = FeedbackItem.Create(
            Guid.NewGuid(),
            request.Category,
            request.Message,
            request.UserId,
            request.UserEmail);

        await _repo.AddAsync(item, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
        return item.Id;
    }
}
