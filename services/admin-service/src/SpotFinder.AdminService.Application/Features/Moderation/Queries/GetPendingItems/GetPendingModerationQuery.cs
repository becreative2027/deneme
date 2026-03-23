using SpotFinder.AdminService.Domain.Enums;
using SpotFinder.BuildingBlocks.Application;

namespace SpotFinder.AdminService.Application.Features.Moderation.Queries.GetPendingItems;

public sealed record GetPendingModerationQuery(ModerationTargetType? TargetType, int Page, int PageSize) : IQuery<PagedResult<ModerationItemDto>>;
public sealed record ModerationItemDto(Guid Id, string TargetType, Guid TargetId, string Status, DateTime CreatedAt);
