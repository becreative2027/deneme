using MediatR;
using Microsoft.EntityFrameworkCore;
using SpotFinder.FeedService.Infrastructure.Persistence;

namespace SpotFinder.FeedService.Application.Features.Feed.Queries.GetUserPostCount;

public sealed class GetUserPostCountQueryHandler(FeedQueryDbContext db)
    : IRequestHandler<GetUserPostCountQuery, int>
{
    public Task<int> Handle(GetUserPostCountQuery request, CancellationToken ct) =>
        db.Posts.CountAsync(p => p.UserId == request.UserId, ct);
}
