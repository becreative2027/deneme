using MediatR;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.SocialGraphService.Application.Features.Social.Commands.AddFavorite;

public sealed record AddFavoriteCommand(Guid UserId, Guid PlaceId)
    : IRequest<ApiResult<bool>>;
