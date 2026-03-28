using MediatR;
using SpotFinder.AdminService.Domain.Enums;

namespace SpotFinder.AdminService.Application.Features.PlaceNotifications.Commands.SendNotification;

public sealed record SendPlaceNotificationCommand(
    Guid   PlaceId,
    string Title,
    string Body,
    string Type,
    NotificationAudience Audience,
    string SentBy
) : IRequest<SendPlaceNotificationResult>;

public sealed record SendPlaceNotificationResult(
    Guid Id,
    int  RecipientCount
);
