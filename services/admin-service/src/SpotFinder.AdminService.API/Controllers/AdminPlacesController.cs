using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpotFinder.AdminService.Application.Features.Places.Commands.Create;
using SpotFinder.AdminService.Application.Features.Places.Commands.Delete;
using SpotFinder.AdminService.Application.Features.Places.Commands.Update;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.AdminService.API.Controllers;

[Authorize(Roles = "Admin,SuperAdmin")]
[Route("api/admin/places")]
public sealed class AdminPlacesController : BaseController
{
    public AdminPlacesController(ISender sender) : base(sender) { }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] AdminCreatePlaceCommand cmd, CancellationToken ct)
    {
        var result = await Sender.Send(cmd, ct);
        if (!result.IsSuccess)
            return FailResult(string.Join("; ", result.Errors));

        return CreatedAtAction(nameof(Create), new { id = result.Data }, ApiResponse<Guid>.Ok(result.Data));
    }

    [HttpPut("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(Guid id, [FromBody] AdminUpdatePlaceRequest request, CancellationToken ct)
    {
        var cmd = new AdminUpdatePlaceCommand(
            id, request.CountryId, request.CityId, request.DistrictId,
            request.Latitude, request.Longitude, request.GooglePlaceId,
            request.ParkingStatus, request.Rating, request.UpdatedBy);

        var result = await Sender.Send(cmd, ct);
        if (!result.IsSuccess)
            return FailResult(string.Join("; ", result.Errors));

        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(Guid id, [FromQuery] string? deletedBy, CancellationToken ct)
    {
        var result = await Sender.Send(new AdminDeletePlaceCommand(id, deletedBy), ct);
        if (!result.IsSuccess)
            return FailResult(string.Join("; ", result.Errors), 404);

        return NoContent();
    }
}

public sealed record AdminUpdatePlaceRequest(
    int?     CountryId,
    int?     CityId,
    int?     DistrictId,
    double?  Latitude,
    double?  Longitude,
    string?  GooglePlaceId,
    string?  ParkingStatus,
    decimal? Rating,
    string?  UpdatedBy);
