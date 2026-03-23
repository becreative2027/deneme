using MediatR;
using Microsoft.AspNetCore.Mvc;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.GeoService.Application.Features.Cities.Queries.GetCitiesByCountry;

namespace SpotFinder.GeoService.API.Controllers;

public sealed class CitiesController : BaseController
{
    public CitiesController(ISender sender) : base(sender) { }

    [HttpGet("by-country/{countryId:int}")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<CityDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByCountry(int countryId, [FromQuery] int langId = 1, CancellationToken ct = default)
        => OkResult(await Sender.Send(new GetCitiesByCountryQuery(countryId, langId), ct));
}
