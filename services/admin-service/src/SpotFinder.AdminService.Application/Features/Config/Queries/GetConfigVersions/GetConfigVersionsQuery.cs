using MediatR;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.AdminService.Application.Features.Config.Queries.GetConfigVersions;

public sealed record ConfigVersionDto(
    Guid     Id,
    string   Key,
    string   Value,
    int      Version,
    DateTime CreatedAt,
    string   CreatedBy,
    string   ChangeReason
);

/// <summary>Phase 7.4 — Returns all versions for a specific config key, newest first.</summary>
public sealed record GetConfigVersionsQuery(string Key)
    : IRequest<ApiResult<IReadOnlyList<ConfigVersionDto>>>;
