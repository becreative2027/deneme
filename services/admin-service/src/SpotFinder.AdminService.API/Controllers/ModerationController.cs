using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpotFinder.AdminService.Application.Features.Moderation.Commands.ReviewItem;
using SpotFinder.AdminService.Application.Features.Moderation.Queries.GetPendingItems;
using SpotFinder.AdminService.Domain.Enums;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.BuildingBlocks.Application;

namespace SpotFinder.AdminService.API.Controllers;

[Authorize(Roles = "Admin,SuperAdmin")]
[Route("api/admin/moderation")]
public sealed class ModerationController : BaseController
{
    public ModerationController(ISender sender) : base(sender) { }

    [HttpGet("pending")]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<ModerationItemDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetPending(
        [FromQuery] ModerationTargetType? type,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
        => OkResult(await Sender.Send(new GetPendingModerationQuery(type, page, pageSize), ct));

    [HttpPost("{id:guid}/review")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Review(Guid id, [FromBody] ReviewModerationItemRequest request, CancellationToken ct)
    {
        await Sender.Send(new ReviewModerationItemCommand(id, request.AdminId, request.Approve, request.Note), ct);
        return NoContent();
    }
}

public sealed record ReviewModerationItemRequest(Guid AdminId, bool Approve, string? Note);
