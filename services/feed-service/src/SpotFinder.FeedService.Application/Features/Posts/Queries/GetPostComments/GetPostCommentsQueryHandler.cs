using MediatR;
using Microsoft.EntityFrameworkCore;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.FeedService.Infrastructure.Persistence;

namespace SpotFinder.FeedService.Application.Features.Posts.Queries.GetPostComments;

public sealed class GetPostCommentsQueryHandler(FeedQueryDbContext db)
    : IRequestHandler<GetPostCommentsQuery, ApiResult<List<PostCommentDto>>>
{
    public async Task<ApiResult<List<PostCommentDto>>> Handle(GetPostCommentsQuery query, CancellationToken ct)
    {
        var comments = await (
            from c in db.PostComments
            where c.PostId == query.PostId
            join u in db.Users on c.UserId equals u.Id into ug
            from u in ug.DefaultIfEmpty()
            join pr in db.UserProfiles on c.UserId equals pr.UserId into prg
            from pr in prg.DefaultIfEmpty()
            orderby c.CreatedAt descending
            select new PostCommentDto(
                c.Id,
                c.UserId,
                u != null ? u.Username : "Kullanıcı",
                pr != null ? pr.DisplayName : null,
                pr != null ? pr.ProfileImageUrl : null,
                c.Text,
                c.CreatedAt)
        )
        .Skip((query.Page - 1) * query.PageSize)
        .Take(query.PageSize)
        .ToListAsync(ct);

        return ApiResult<List<PostCommentDto>>.Ok(comments);
    }
}
