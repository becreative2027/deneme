using MediatR;
using SpotFinder.AdminService.Domain.Enums;

namespace SpotFinder.AdminService.Application.Features.Moderation.Commands.ReportContent;

public sealed record ReportContentCommand(ModerationTargetType TargetType, Guid TargetId, string? ReporterId, string? Reason) : IRequest<Guid>;
