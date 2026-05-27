using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpotFinder.AdminService.Application.Features.Feedback.Commands.MarkReviewed;
using SpotFinder.AdminService.Application.Features.Feedback.Commands.RespondToFeedback;
using SpotFinder.AdminService.Application.Features.Feedback.Queries.GetFeedback;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.AdminService.API.Controllers;

[Authorize(Roles = "Admin,SuperAdmin")]
[Route("api/admin/feedback")]
public sealed class AdminFeedbackController : BaseController
{
    public AdminFeedbackController(ISender sender) : base(sender) { }

    [HttpGet]
    public async Task<IActionResult> GetAll(
        [FromQuery] bool? reviewed,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 30,
        CancellationToken ct = default)
    {
        var result = await Sender.Send(new GetFeedbackQuery(reviewed, page, pageSize), ct);
        return OkResult(result);
    }

    [HttpPatch("{id:guid}/review")]
    public async Task<IActionResult> MarkReviewed(Guid id, CancellationToken ct)
    {
        await Sender.Send(new MarkFeedbackReviewedCommand(id), ct);
        return OkResult("Marked as reviewed.");
    }

    /// <summary>Send a push notification response to the user and mark feedback as reviewed.</summary>
    [HttpPost("{id:guid}/respond")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Respond(Guid id, [FromBody] RespondRequest request, CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Message)) return BadRequest("Message is required.");
        await Sender.Send(new RespondToFeedbackCommand(id, request.Message), ct);
        return NoContent();
    }
}

public sealed record RespondRequest(string Message);
