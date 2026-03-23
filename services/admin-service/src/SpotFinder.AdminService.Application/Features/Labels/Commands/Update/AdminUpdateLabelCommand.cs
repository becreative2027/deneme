using MediatR;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.AdminService.Application.Features.Labels.Commands.Update;

public sealed record AdminUpdateLabelCommand(
    int     LabelId,
    string? Key,
    bool?   IsActive,
    string? UpdatedBy)
    : IRequest<ApiResult<bool>>;
