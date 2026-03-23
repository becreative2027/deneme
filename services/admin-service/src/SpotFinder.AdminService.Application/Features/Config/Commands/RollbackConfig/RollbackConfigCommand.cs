using MediatR;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.AdminService.Application.Features.Config.Commands.RollbackConfig;

/// <summary>
/// Phase 7.4 — Rolls back a config key to a specific historical version.
///
/// Restores runtime_configs.value from runtime_config_versions, inserts a new version
/// snapshot (so rollbacks are themselves versioned), and emits an audit log entry.
/// </summary>
public sealed record RollbackConfigCommand(
    string Key,
    int    TargetVersion,
    string RolledBackBy,
    string ChangeReason    // e.g. "Trending cap caused P99 latency spike — rolling back"
) : IRequest<ApiResult<UpsertRuntimeConfigResult>>;

public sealed record UpsertRuntimeConfigResult(string Key, int Version);
