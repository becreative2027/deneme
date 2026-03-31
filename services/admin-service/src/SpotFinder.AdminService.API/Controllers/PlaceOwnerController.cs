using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpotFinder.AdminService.Application.Features.Labels.Commands.Assign;
using SpotFinder.AdminService.Application.Features.Labels.Commands.Remove;
using SpotFinder.AdminService.Application.Features.Places.Commands.Update;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.AdminService.API.Controllers;

/// <summary>
/// Endpoints accessible by PlaceOwner (and Admins).
/// Every mutating action verifies the caller owns the requested placeId
/// via the "owned_places" JWT claim.
/// </summary>
[Authorize(Roles = "PlaceOwner,Admin,SuperAdmin")]
[Route("api/owner")]
public sealed class PlaceOwnerController : BaseController
{
    public PlaceOwnerController(ISender sender) : base(sender) { }

    // ── helpers ──────────────────────────────────────────────────────────

    private string CallerEmail =>
        User.FindFirstValue(ClaimTypes.Email)
        ?? User.FindFirstValue(ClaimTypes.NameIdentifier)
        ?? "unknown";

    /// Returns true when caller is Admin/SuperAdmin OR owns the place.
    private bool OwnsPlace(Guid placeId)
    {
        var role = User.FindFirstValue(ClaimTypes.Role)
                ?? User.FindFirstValue("http://schemas.microsoft.com/ws/2008/06/identity/claims/role")
                ?? string.Empty;

        if (role is "Admin" or "SuperAdmin") return true;

        var owned = User.FindFirstValue("owned_places") ?? string.Empty;
        return owned.Split(',').Contains(placeId.ToString());
    }

    // ── Place media ───────────────────────────────────────────────────────

    /// <summary>PUT /api/owner/places/{id} — update cover image, menu url, menu images</summary>
    [HttpPut("places/{id:guid}")]
    public async Task<IActionResult> UpdateMedia(
        Guid id,
        [FromBody] UpdatePlaceMediaRequest req,
        CancellationToken ct)
    {
        if (!OwnsPlace(id))
            return StatusCode(403, ApiResponse<string>.Fail("Bu mekana erişim yetkiniz yok."));

        var cmd = new AdminUpdatePlaceCommand(
            PlaceId:       id,
            CountryId:     null,
            CityId:        null,
            DistrictId:    null,
            Latitude:      null,
            Longitude:     null,
            GooglePlaceId: null,
            ParkingStatus: null,
            Rating:        null,
            UpdatedBy:     CallerEmail,
            CoverImageUrl: req.CoverImageUrl,
            MenuUrl:       req.MenuUrl,
            MenuImageUrls: req.MenuImageUrls,
            PriceLevel:    req.PriceLevel,
            VenueType:     req.VenueType);

        var result = await Sender.Send(cmd, ct);
        if (!result.IsSuccess)
            return FailResult(string.Join("; ", result.Errors));

        return OkResult("Güncellendi.");
    }

    // ── Labels ────────────────────────────────────────────────────────────

    /// <summary>POST /api/owner/places/{placeId}/labels/{labelId}</summary>
    [HttpPost("places/{placeId:guid}/labels/{labelId:int}")]
    public async Task<IActionResult> AssignLabel(
        Guid placeId,
        int  labelId,
        CancellationToken ct)
    {
        if (!OwnsPlace(placeId))
            return StatusCode(403, ApiResponse<string>.Fail("Bu mekana erişim yetkiniz yok."));

        var result = await Sender.Send(
            new AdminAssignLabelToPlaceCommand(placeId, labelId, 1.0m, CallerEmail), ct);

        if (!result.IsSuccess)
            return FailResult(string.Join("; ", result.Errors));

        return OkResult("Etiket eklendi.");
    }

    /// <summary>DELETE /api/owner/places/{placeId}/labels/{labelId}</summary>
    [HttpDelete("places/{placeId:guid}/labels/{labelId:int}")]
    public async Task<IActionResult> RemoveLabel(
        Guid placeId,
        int  labelId,
        CancellationToken ct)
    {
        if (!OwnsPlace(placeId))
            return StatusCode(403, ApiResponse<string>.Fail("Bu mekana erişim yetkiniz yok."));

        var result = await Sender.Send(
            new AdminRemoveLabelFromPlaceCommand(placeId, labelId, CallerEmail), ct);

        if (!result.IsSuccess)
            return FailResult(string.Join("; ", result.Errors));

        return OkResult("Etiket kaldırıldı.");
    }
}

public sealed record UpdatePlaceMediaRequest(
    string?       CoverImageUrl,
    string?       MenuUrl,
    List<string>? MenuImageUrls,
    int?          PriceLevel,
    string?       VenueType);
