using System.Net.Http.Json;
using MediatR;
using SpotFinder.AdminService.Domain.Entities;
using SpotFinder.AdminService.Domain.Repositories;
using SpotFinder.AdminService.Infrastructure.Services;

namespace SpotFinder.AdminService.Application.Features.PlaceNotifications.Commands.SendNotification;

public sealed class SendPlaceNotificationCommandHandler
    : IRequestHandler<SendPlaceNotificationCommand, SendPlaceNotificationResult>
{
    private readonly IPlaceNotificationRepository _repo;
    private readonly IExpoPushService _push;
    private readonly IHttpClientFactory _httpFactory;

    public SendPlaceNotificationCommandHandler(
        IPlaceNotificationRepository repo,
        IExpoPushService push,
        IHttpClientFactory httpFactory)
    {
        _repo       = repo;
        _push       = push;
        _httpFactory = httpFactory;
    }

    public async Task<SendPlaceNotificationResult> Handle(
        SendPlaceNotificationCommand request,
        CancellationToken cancellationToken)
    {
        // Rate limit: max 5 notifications per place per day (UTC)
        const int DailyLimit = 5;
        var sentToday = await _repo.GetTodayCountAsync(request.PlaceId, cancellationToken);
        if (sentToday >= DailyLimit)
            throw new InvalidOperationException("daily_limit_exceeded");

        // Resolve target audience user IDs
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

        // Fetch push tokens for target users from identity service
        if (userIds.Count > 0)
        {
            try
            {
                var http = _httpFactory.CreateClient("identity");
                var tokenResponse = await http.PostAsJsonAsync(
                    "/api/notifications/tokens-by-users",
                    new { UserIds = userIds },
                    cancellationToken);

                if (tokenResponse.IsSuccessStatusCode)
                {
                    var tokens = await tokenResponse.Content
                        .ReadFromJsonAsync<List<string>>(cancellationToken: cancellationToken)
                        ?? [];

                    await _push.SendAsync(
                        tokens,
                        request.Title,
                        request.Body,
                        request.Type,
                        request.PlaceId.ToString(),
                        cancellationToken);
                }
            }
            catch
            {
                // Push delivery failure should not fail the notification record save
            }
        }

        return new SendPlaceNotificationResult(notification.Id, userIds.Count);
    }
}
