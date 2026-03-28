using MediatR;
using SpotFinder.AdminService.Domain.Repositories;
using SpotFinder.AdminService.Infrastructure.Persistence;

namespace SpotFinder.AdminService.Application.Features.Feedback.Commands.MarkReviewed;

public sealed class MarkFeedbackReviewedCommandHandler : IRequestHandler<MarkFeedbackReviewedCommand>
{
    private readonly IFeedbackRepository _repo;
    private readonly AdminDbContext      _db;

    public MarkFeedbackReviewedCommandHandler(IFeedbackRepository repo, AdminDbContext db)
    {
        _repo = repo;
        _db   = db;
    }

    public async Task Handle(MarkFeedbackReviewedCommand request, CancellationToken cancellationToken)
    {
        var item = await _repo.GetByIdAsync(request.FeedbackId, cancellationToken)
            ?? throw new InvalidOperationException("Feedback item not found.");
        item.MarkReviewed();
        _repo.Update(item);
        await _db.SaveChangesAsync(cancellationToken);
    }
}
