using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpotFinder.AdminService.Application.Features.Feedback.Commands.SubmitFeedback;
using SpotFinder.AdminService.Domain.Enums;
using SpotFinder.BuildingBlocks.Api;
using System.Security.Claims;

namespace SpotFinder.AdminService.API.Controllers;

[Authorize]
[Route("api/feedback")]
public sealed class FeedbackController : BaseController
{
    public FeedbackController(ISender sender) : base(sender) { }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Submit([FromBody] SubmitFeedbackRequest request, CancellationToken ct)
    {
        if (!Enum.TryParse<FeedbackCategory>(request.Category, ignoreCase: true, out var category))
            return BadRequest(ApiResponse<string>.Fail($"Unknown category: {request.Category}"));

        if (string.IsNullOrWhiteSpace(request.Message))
            return BadRequest(ApiResponse<string>.Fail("Message is required."));

        var userId    = User.FindFirstValue(ClaimTypes.NameIdentifier);
        var userEmail = User.FindFirstValue(ClaimTypes.Email);

        var id = await Sender.Send(
            new SubmitFeedbackCommand(category, request.Message.Trim(), userId, userEmail), ct);

        return OkResult(id);
    }
}

public sealed record SubmitFeedbackRequest(string Category, string Message);
