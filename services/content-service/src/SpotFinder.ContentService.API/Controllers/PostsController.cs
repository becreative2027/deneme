using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.ContentService.Application.Features.Posts.Commands.AddMedia;
using SpotFinder.ContentService.Application.Features.Posts.Commands.Comment;
using SpotFinder.ContentService.Application.Features.Posts.Commands.Create;
using SpotFinder.ContentService.Application.Features.Posts.Commands.Like;
using SpotFinder.ContentService.Application.Features.Posts.Commands.Unlike;

namespace SpotFinder.ContentService.API.Controllers;

[Authorize]
[Route("api/posts")]
public sealed class PostsController : BaseController
{
    public PostsController(ISender sender) : base(sender) { }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] CreatePostRequest request, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var cmd = new CreatePostCommand(userId, request.PlaceId, request.Caption);
        var result = await Sender.Send(cmd, ct);
        if (!result.IsSuccess)
            return FailResult(string.Join("; ", result.Errors));
        return CreatedAtAction(nameof(Create), new { id = result.Data }, ApiResponse<Guid>.Ok(result.Data));
    }

    [HttpPost("{id:guid}/media")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> AddMedia(Guid id, [FromBody] AddMediaRequest request, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var cmd = new AddPostMediaCommand(id, userId, request.Url, request.Type);
        var result = await Sender.Send(cmd, ct);
        if (!result.IsSuccess)
            return FailResult(string.Join("; ", result.Errors));
        return CreatedAtAction(nameof(AddMedia), new { id = result.Data }, ApiResponse<Guid>.Ok(result.Data));
    }

    [HttpPost("{id:guid}/like")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Like(Guid id, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await Sender.Send(new LikePostCommand(userId, id), ct);
        if (!result.IsSuccess)
            return FailResult(string.Join("; ", result.Errors));
        return NoContent();
    }

    [HttpPost("{id:guid}/unlike")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Unlike(Guid id, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await Sender.Send(new UnlikePostCommand(userId, id), ct);
        if (!result.IsSuccess)
            return FailResult(string.Join("; ", result.Errors));
        return NoContent();
    }

    [HttpPost("{id:guid}/comment")]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Comment(Guid id, [FromBody] CommentRequest request, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var cmd = new CommentPostCommand(userId, id, request.Text);
        var result = await Sender.Send(cmd, ct);
        if (!result.IsSuccess)
            return FailResult(string.Join("; ", result.Errors));
        return CreatedAtAction(nameof(Comment), new { id = result.Data }, ApiResponse<Guid>.Ok(result.Data));
    }
}

public sealed record CreatePostRequest(Guid PlaceId, string? Caption);
public sealed record AddMediaRequest(string Url, string? Type);
public sealed record CommentRequest(string Text);
