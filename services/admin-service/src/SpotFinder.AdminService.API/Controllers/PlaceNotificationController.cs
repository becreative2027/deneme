using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpotFinder.AdminService.Application.Features.PlaceNotifications.Commands.SendNotification;
using SpotFinder.AdminService.Application.Features.PlaceNotifications.Queries.GetHistory;
using SpotFinder.AdminService.Domain.Enums;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.AdminService.API.Controllers;

[Authorize(Roles = "PlaceOwner,Admin,SuperAdmin")]
[Route("api/admin/notifications")]
public sealed class PlaceNotificationController : BaseController
{
    public PlaceNotificationController(ISender sender) : base(sender) { }

    /// <summary>GET /api/admin/notifications/{placeId}?page=1&pageSize=20</summary>
    [HttpGet("{placeId:guid}")]
    public async Task<IActionResult> GetHistory(
        Guid placeId,
        [FromQuery] int page     = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct     = default)
    {
        var result = await Sender.Send(
            new GetPlaceNotificationHistoryQuery(placeId, page, pageSize), ct);
        return OkResult(result);
    }

    /// <summary>POST /api/admin/notifications</summary>
    [HttpPost]
    public async Task<IActionResult> Send(
        [FromBody] SendNotificationRequest request,
        CancellationToken ct = default)
    {
        if (!Enum.TryParse<NotificationAudience>(request.Audience, ignoreCase: true, out var audience))
            return BadRequest(ApiResponse<string>.Fail("Geçersiz hedef kitle."));

        var sentBy = User.FindFirstValue(ClaimTypes.Email)
                  ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
                  ?? "unknown";

        try
        {
            var result = await Sender.Send(new SendPlaceNotificationCommand(
                request.PlaceId,
                request.Title,
                request.Body,
                request.Type,
                audience,
                sentBy), ct);

            return OkResult(result);
        }
        catch (InvalidOperationException ex) when (ex.Message == "daily_limit_exceeded")
        {
            return Conflict(ApiResponse<string>.Fail(
                "Bu mekan için bugün zaten bir bildirim gönderildi. Yarın tekrar deneyin."));
        }
    }
}

public sealed record SendNotificationRequest(
    Guid   PlaceId,
    string Title,
    string Body,
    string Type,
    string Audience   // "Favorites" | "Wishlist" | "Nearby"
);
