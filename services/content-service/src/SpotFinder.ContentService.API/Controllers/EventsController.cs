using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.ContentService.Application.Features.Events.Commands.RecordDwell;

namespace SpotFinder.ContentService.API.Controllers;

/// <summary>
/// Ingest endpoint for client-side interaction signals.
///
/// Phase 7.2 — dwell-time signal pipeline.
/// Events are stored in <c>content.user_events</c>; scoring integration
/// is deferred to a future phase.
/// </summary>
[Authorize]
[Route("api/events")]
public sealed class EventsController : BaseController
{
    public EventsController(ISender sender) : base(sender) { }

    /// <summary>
    /// Records how long the authenticated user viewed a post.
    /// </summary>
    /// <remarks>
    /// Security: <c>userId</c> is extracted from the JWT — the client cannot
    /// spoof the acting user by injecting a userId into the request body.
    /// </remarks>
    [HttpPost("dwell")]
    [ProducesResponseType(typeof(ApiResponse<bool>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> RecordDwell(
        [FromBody] RecordDwellRequest request, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var cmd    = new RecordDwellCommand(userId, request.PostId, request.DurationMs);
        var result = await Sender.Send(cmd, ct);
        return result.IsSuccess
            ? Ok(ApiResponse<bool>.Ok(result.Data))
            : FailResult(string.Join("; ", result.Errors));
    }
}

/// <summary>Request body for POST /api/events/dwell.</summary>
public sealed record RecordDwellRequest(Guid PostId, int DurationMs);
