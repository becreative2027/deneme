using MediatR;
using SpotFinder.AdminService.Domain.Entities.Write;
using SpotFinder.AdminService.Infrastructure.Persistence;

namespace SpotFinder.AdminService.Application.Features.PlaceEvents.Commands;

public sealed class CreatePlaceEventCommandHandler
    : IRequestHandler<CreatePlaceEventCommand, Guid>
{
    private readonly AdminWriteDbContext _db;

    public CreatePlaceEventCommandHandler(AdminWriteDbContext db) => _db = db;

    public async Task<Guid> Handle(
        CreatePlaceEventCommand request, CancellationToken cancellationToken)
    {
        var ev = new AdminPlaceEventWrite
        {
            Id          = Guid.NewGuid(),
            PlaceId     = request.PlaceId,
            Title       = request.Title,
            Description = request.Description,
            StartsAt    = request.StartsAt.ToUniversalTime(),
            EndsAt      = request.EndsAt?.ToUniversalTime(),
            ImageUrl    = request.ImageUrl,
            CreatedBy   = request.CreatedBy,
            CreatedAt   = DateTime.UtcNow,
        };

        await _db.PlaceEvents.AddAsync(ev, cancellationToken);
        await _db.SaveChangesAsync(cancellationToken);

        return ev.Id;
    }
}
