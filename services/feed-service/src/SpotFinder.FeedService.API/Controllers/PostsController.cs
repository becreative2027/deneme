using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpotFinder.FeedService.Application.Features.Posts.Queries.GetPostComments;

namespace SpotFinder.FeedService.API.Controllers;

[ApiController]
[Route("api/posts")]
[Authorize]
public sealed class PostsController(ISender sender) : ControllerBase
{
    [HttpGet("{id:guid}/comments")]
    public async Task<IActionResult> GetComments(
        Guid id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 30,
        CancellationToken ct = default)
    {
        var result = await sender.Send(new GetPostCommentsQuery(id, page, pageSize), ct);
        return Ok(result);
    }
}
