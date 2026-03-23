using MediatR;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.AdminService.Application.Features.Places.Commands.Delete;

public sealed record AdminDeletePlaceCommand(Guid PlaceId, string? DeletedBy)
    : IRequest<ApiResult<bool>>;
