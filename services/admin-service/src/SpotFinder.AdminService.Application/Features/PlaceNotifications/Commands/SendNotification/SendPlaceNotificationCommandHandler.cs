using MediatR;
using SpotFinder.AdminService.Domain.Entities;
using SpotFinder.AdminService.Domain.Repositories;

namespace SpotFinder.AdminService.Application.Features.PlaceNotifications.Commands.SendNotification;

public sealed class SendPlaceNotificationCommandHandler
    : IRequestHandler<SendPlaceNotificationCommand, SendPlaceNotificationResult>
{
    private readonly IPlaceNotificationRepository _repo;

    public SendPlaceNotificationCommandHandler(IPlaceNotificationRepository repo)
        => _repo = repo;

    public async Task<SendPlaceNotificationResult> Handle(
        SendPlaceNotificationCommand request,
        CancellationToken cancellationToken)
    {
        // Rate limit: max 5 notifications per place per day (UTC)
        const int DailyLimit = 5;
        var sentToday = await _repo.GetTodayCountAsync(request.PlaceId, cancellationToken);
        if (sentToday >= DailyLimit)
            throw new InvalidOperationException("daily_limit_exceeded");

        // Resolve target audience
        var userIds = await _repo.GetAudienceUserIdsAsync(
            request.PlaceId, request.Audience, cancellationToken);

        var notification = PlaceNotification.Create(
            Guid.NewGuid(),
            request.PlaceId,
            request.Title,
            request.Body,
            request.Type,
            request.Audience,
            request.SentBy,
            userIds.Count);

        await _repo.AddAsync(notification, cancellationToken);

        // TODO: enqueue actual push notification delivery (Expo / FCM) for each userId

        return new SendPlaceNotificationResult(notification.Id, userIds.Count);
    }
}
