using MediatR;
using Microsoft.EntityFrameworkCore;
using SpotFinder.AdminService.Infrastructure.Persistence;

namespace SpotFinder.AdminService.Application.Features.PlaceEvents.Commands;

public sealed class DeletePlaceEventCommandHandler
    : IRequestHandler<DeletePlaceEventCommand, bool>
{
    private readonly AdminWriteDbContext _db;

    public DeletePlaceEventCommandHandler(AdminWriteDbContext db) => _db = db;

    public async Task<bool> Handle(
        DeletePlaceEventCommand request, CancellationToken cancellationToken)
    {
        var ev = await _db.PlaceEvents
            .FirstOrDefaultAsync(
                e => e.Id == request.EventId && e.PlaceId == request.PlaceId,
                cancellationToken);

        if (ev is null) return false;

        _db.PlaceEvents.Remove(ev);
        await _db.SaveChangesAsync(cancellationToken);
        return true;
    }
}
