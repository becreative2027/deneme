using MediatR;
using Microsoft.AspNetCore.Mvc;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.GeoService.Application.Features.Districts.Queries.GetDistrictsByCity;

namespace SpotFinder.GeoService.API.Controllers;

public sealed class DistrictsController : BaseController
{
    public DistrictsController(ISender sender) : base(sender) { }

    [HttpGet("by-city/{cityId:int}")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<DistrictDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByCity(int cityId, [FromQuery] int langId = 1, CancellationToken ct = default)
        => OkResult(await Sender.Send(new GetDistrictsByCityQuery(cityId, langId), ct));
}
