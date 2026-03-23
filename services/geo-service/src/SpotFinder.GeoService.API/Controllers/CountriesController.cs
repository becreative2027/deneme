using MediatR;
using Microsoft.AspNetCore.Mvc;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.GeoService.Application.Features.Countries.Queries.GetAllCountries;

namespace SpotFinder.GeoService.API.Controllers;

public sealed class CountriesController : BaseController
{
    public CountriesController(ISender sender) : base(sender) { }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<CountryDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] int langId = 1, CancellationToken ct = default)
        => OkResult(await Sender.Send(new GetAllCountriesQuery(langId), ct));
}
