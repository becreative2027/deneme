using MediatR;

namespace SpotFinder.FeedService.Application.Features.Feed.Queries.GetUserPostCount;

public sealed record GetUserPostCountQuery(Guid UserId) : IRequest<int>;
