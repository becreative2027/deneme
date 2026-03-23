using MediatR;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.AdminService.Application.Features.Config.Commands.UpsertFeatureFlag;

/// <summary>
/// Phase 7.4 — Creates or updates a feature flag with targeting support.
///
/// Target (optional JSON): {"userIds":["uuid1"],"countries":["TR"],"platform":["ios"]}
/// When Target is set it overrides RolloutPercentage — only matching users see the flag.
/// ChangeReason is required for auditability.
/// </summary>
public sealed record UpsertFeatureFlagCommand(
    string  Key,
    bool    IsEnabled,
    int     RolloutPercentage,
    string? Target,         // optional targeting JSON
    string  ChangedBy,
    string  ChangeReason
) : IRequest<ApiResult<string>>;
