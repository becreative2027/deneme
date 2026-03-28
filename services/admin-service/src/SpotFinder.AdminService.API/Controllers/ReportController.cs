using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpotFinder.AdminService.Application.Features.Moderation.Commands.ReportContent;
using SpotFinder.AdminService.Domain.Enums;
using SpotFinder.BuildingBlocks.Api;
using System.Security.Claims;

namespace SpotFinder.AdminService.API.Controllers;

[Authorize]
[Route("api/report")]
public sealed class ReportController : BaseController
{
    public ReportController(ISender sender) : base(sender) { }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> Report([FromBody] ReportRequest request, CancellationToken ct)
    {
        if (!Enum.TryParse<ModerationTargetType>(request.TargetType, ignoreCase: true, out var targetType))
            return BadRequest(ApiResponse<string>.Fail($"Unknown target type: {request.TargetType}"));

        var reporterId = User.FindFirstValue(ClaimTypes.NameIdentifier)
                      ?? User.FindFirstValue(ClaimTypes.Email);

        try
        {
            var id = await Sender.Send(new ReportContentCommand(targetType, request.TargetId, reporterId, request.Reason), ct);
            return OkResult(id);
        }
        catch (InvalidOperationException ex) when (ex.Message == "already_reported")
        {
            return Conflict(ApiResponse<string>.Fail("Bu içeriği zaten şikayet ettiniz."));
        }
    }
}

public sealed record ReportRequest(string TargetType, Guid TargetId, string? Reason);
