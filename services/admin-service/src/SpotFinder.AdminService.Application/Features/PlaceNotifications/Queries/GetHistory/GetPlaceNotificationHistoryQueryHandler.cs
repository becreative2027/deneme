using MediatR;
using SpotFinder.AdminService.Domain.Repositories;

namespace SpotFinder.AdminService.Application.Features.PlaceNotifications.Queries.GetHistory;

public sealed class GetPlaceNotificationHistoryQueryHandler
    : IRequestHandler<GetPlaceNotificationHistoryQuery, PlaceNotificationHistoryResult>
{
    private readonly IPlaceNotificationRepository _repo;

    public GetPlaceNotificationHistoryQueryHandler(IPlaceNotificationRepository repo)
        => _repo = repo;

    public async Task<PlaceNotificationHistoryResult> Handle(
        GetPlaceNotificationHistoryQuery request,
        CancellationToken cancellationToken)
    {
        var items = await _repo.GetByPlaceIdAsync(
            request.PlaceId, request.Page, request.PageSize, cancellationToken);

        const int DailyLimit = 5;
        var total      = await _repo.GetTotalAsync(request.PlaceId, cancellationToken);
        var todayCount = await _repo.GetTodayCountAsync(request.PlaceId, cancellationToken);

        var dtos = items.Select(n => new PlaceNotificationDto(
            n.Id,
            n.Title,
            n.Body,
            n.Type,
            n.Audience.ToString(),
            n.RecipientCount,
            n.SentAt)).ToList();

        return new PlaceNotificationHistoryResult(dtos, total, todayCount < DailyLimit, DailyLimit - todayCount);
    }
}
