using MediatR;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.AdminService.Application.Features.Labels.Commands.Remove;

public sealed record AdminRemoveLabelFromPlaceCommand(
    Guid    PlaceId,
    int     LabelId,
    string? RemovedBy = null)
    : IRequest<ApiResult<bool>>;
