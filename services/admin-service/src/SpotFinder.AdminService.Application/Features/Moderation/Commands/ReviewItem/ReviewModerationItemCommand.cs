using SpotFinder.BuildingBlocks.Application;

namespace SpotFinder.AdminService.Application.Features.Moderation.Commands.ReviewItem;

public sealed record ReviewModerationItemCommand(Guid ModerationItemId, Guid AdminId, bool Approve, string? Note) : ICommand;
