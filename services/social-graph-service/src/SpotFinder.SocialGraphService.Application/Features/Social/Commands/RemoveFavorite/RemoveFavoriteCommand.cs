using MediatR;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.SocialGraphService.Application.Features.Social.Commands.RemoveFavorite;

public sealed record RemoveFavoriteCommand(Guid UserId, Guid PlaceId)
    : IRequest<ApiResult<bool>>;
