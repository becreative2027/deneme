using MediatR;

namespace SpotFinder.AdminService.Application.Features.PlaceNotifications.Queries.GetHistory;

public sealed record GetPlaceNotificationHistoryQuery(
    Guid PlaceId,
    int  Page     = 1,
    int  PageSize = 20
) : IRequest<PlaceNotificationHistoryResult>;

public sealed record PlaceNotificationHistoryResult(
    IReadOnlyList<PlaceNotificationDto> Items,
    int                                 TotalCount,
    bool                                CanSendToday,
    int                                 RemainingToday
);

public sealed record PlaceNotificationDto(
    Guid     Id,
    string   Title,
    string   Body,
    string   Type,
    string   Audience,
    int      RecipientCount,
    DateTime SentAt
);
