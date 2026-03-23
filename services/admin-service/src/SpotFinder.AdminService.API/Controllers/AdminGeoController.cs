using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpotFinder.AdminService.Application.Features.Geo.Commands.CreateCity;
using SpotFinder.AdminService.Application.Features.Geo.Commands.CreateDistrict;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.AdminService.API.Controllers;

[Authorize(Roles = "Admin,SuperAdmin")]
[Route("api/admin/geo")]
public sealed class AdminGeoController : BaseController
{
    public AdminGeoController(ISender sender) : base(sender) { }

    [HttpPost("cities")]
    [ProducesResponseType(typeof(ApiResponse<int>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateCity([FromBody] AdminCreateCityCommand cmd, CancellationToken ct)
    {
        var result = await Sender.Send(cmd, ct);
        if (!result.IsSuccess)
            return FailResult(string.Join("; ", result.Errors));

        return CreatedAtAction(nameof(CreateCity), new { id = result.Data }, ApiResponse<int>.Ok(result.Data));
    }

    [HttpPost("districts")]
    [ProducesResponseType(typeof(ApiResponse<int>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> CreateDistrict([FromBody] AdminCreateDistrictCommand cmd, CancellationToken ct)
    {
        var result = await Sender.Send(cmd, ct);
        if (!result.IsSuccess)
            return FailResult(string.Join("; ", result.Errors));

        return CreatedAtAction(nameof(CreateDistrict), new { id = result.Data }, ApiResponse<int>.Ok(result.Data));
    }
}
