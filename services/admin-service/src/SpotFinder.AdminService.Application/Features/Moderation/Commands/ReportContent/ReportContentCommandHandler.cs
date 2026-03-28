using MediatR;
using SpotFinder.AdminService.Domain.Entities;
using SpotFinder.AdminService.Domain.Repositories;
using SpotFinder.AdminService.Infrastructure.Persistence;

namespace SpotFinder.AdminService.Application.Features.Moderation.Commands.ReportContent;

public sealed class ReportContentCommandHandler : IRequestHandler<ReportContentCommand, Guid>
{
    private readonly IModerationRepository _repo;
    private readonly AdminDbContext        _db;

    public ReportContentCommandHandler(IModerationRepository repo, AdminDbContext db)
    {
        _repo = repo;
        _db   = db;
    }

    public async Task<Guid> Handle(ReportContentCommand request, CancellationToken cancellationToken)
    {
        // Prevent duplicate reports from the same user for the same content
        if (request.ReporterId is not null)
        {
            var alreadyReported = await _repo.HasReportedAsync(
                request.ReporterId, request.TargetType, request.TargetId, cancellationToken);

            if (alreadyReported)
                throw new InvalidOperationException("already_reported");
        }

        var item = ModerationItem.Create(Guid.NewGuid(), request.TargetType, request.TargetId, request.ReporterId, request.Reason);
        await _repo.AddAsync(item, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);
        return item.Id;
    }
}
