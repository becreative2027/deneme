using SpotFinder.AdminService.Domain.Enums;
using SpotFinder.BuildingBlocks.Application;

namespace SpotFinder.AdminService.Application.Features.Moderation.Queries.GetPendingItems;

public sealed record GetPendingModerationQuery(ModerationTargetType? TargetType, int Page, int PageSize) : IQuery<PagedResult<ModerationItemDto>>;

public sealed record ModerationItemDto(
    Guid Id,
    string TargetType,
    Guid TargetId,
    string Status,
    string? ReporterId,
    string? ReporterNote,
    DateTime CreatedAt,
    PostSummary? Post,
    UserSummary? Reporter);

public sealed record PostSummary(
    Guid Id,
    string? Caption,
    string? ImageUrl,
    Guid AuthorId,
    string? AuthorUsername,
    string? AuthorAvatarUrl,
    int LikeCount,
    int CommentCount);

public sealed record UserSummary(
    Guid Id,
    string? Username,
    string? DisplayName,
    string? AvatarUrl);
