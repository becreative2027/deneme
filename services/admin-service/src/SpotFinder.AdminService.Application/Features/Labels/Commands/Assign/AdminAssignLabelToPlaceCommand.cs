using MediatR;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.AdminService.Application.Features.Labels.Commands.Assign;

public sealed record AdminAssignLabelToPlaceCommand(
    Guid    PlaceId,
    int     LabelId,
    decimal Weight    = 1.0m,
    string? CreatedBy = null)
    : IRequest<ApiResult<bool>>;
