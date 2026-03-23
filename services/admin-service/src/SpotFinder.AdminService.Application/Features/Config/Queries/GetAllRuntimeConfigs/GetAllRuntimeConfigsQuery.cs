using MediatR;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.AdminService.Application.Features.Config.Queries.GetAllRuntimeConfigs;

public sealed record RuntimeConfigDto(string Key, string Value, int? CurrentVersion, DateTime UpdatedAt);
public sealed record FeatureFlagDto(string Key, bool IsEnabled, int RolloutPercentage, string? Target, DateTime UpdatedAt);

/// <summary>
/// Phase 7.3 — Returns all runtime configs and feature flags for the admin dashboard.
/// </summary>
public sealed record GetAllRuntimeConfigsQuery
    : IRequest<ApiResult<GetAllRuntimeConfigsResponse>>;

public sealed record GetAllRuntimeConfigsResponse(
    IReadOnlyList<RuntimeConfigDto> Configs,
    IReadOnlyList<FeatureFlagDto>   Flags
);
