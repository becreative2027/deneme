using MediatR;
using Microsoft.EntityFrameworkCore;
using SpotFinder.PlaceService.Infrastructure.Persistence;

namespace SpotFinder.PlaceService.Application.Features.Events.Queries.GetPlaceEvents;

public sealed class GetPlaceEventsQueryHandler
    : IRequestHandler<GetPlaceEventsQuery, IReadOnlyList<PlaceEventDto>>
{
    private readonly PlaceDbContext _db;

    public GetPlaceEventsQueryHandler(PlaceDbContext db) => _db = db;

    public async Task<IReadOnlyList<PlaceEventDto>> Handle(
        GetPlaceEventsQuery request, CancellationToken cancellationToken)
    {
        var now = DateTime.UtcNow;

        var query = _db.PlaceEvents
            .Where(e => e.PlaceId == request.PlaceId);

        if (!request.IncludePast)
            // Show events that haven't ended yet (or have no end time and haven't started yet in the past)
            query = query.Where(e => e.EndsAt == null
                ? e.StartsAt >= now.AddHours(-12)   // still show events that started recently
                : e.EndsAt >= now);

        var events = await query
            .OrderBy(e => e.StartsAt)
            .Select(e => new PlaceEventDto(
                e.Id, e.Title, e.Description,
                e.StartsAt, e.EndsAt, e.ImageUrl, e.CreatedAt))
            .ToListAsync(cancellationToken);

        return events;
    }
}
