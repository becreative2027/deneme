using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpotFinder.AdminService.Application.Features.Feedback.Commands.MarkReviewed;
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
}
