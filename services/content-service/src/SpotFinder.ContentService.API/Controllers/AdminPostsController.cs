using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.ContentService.Application.Features.Posts.Commands.Moderate;

namespace SpotFinder.ContentService.API.Controllers;

[Authorize(Roles = "Admin,SuperAdmin")]
[Route("admin/posts")]
public sealed class AdminPostsController : BaseController
{
    public AdminPostsController(ISender sender) : base(sender) { }

    [HttpPost("{id:guid}/moderate")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Moderate(Guid id, [FromBody] ModeratePostRequest request, CancellationToken ct)
    {
        var cmd = new ModeratePostCommand(id, request.Status, request.HiddenReason);
        var result = await Sender.Send(cmd, ct);
        if (!result.IsSuccess)
            return FailResult(string.Join("; ", result.Errors));
        return NoContent();
    }
}

public sealed record ModeratePostRequest(string Status, string? HiddenReason);
