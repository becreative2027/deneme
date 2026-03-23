using MediatR;
using Microsoft.AspNetCore.Mvc;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.PlaceService.Application.Features.Filters.Queries.GetPlaceFilters;

namespace SpotFinder.PlaceService.API.Controllers;

[ApiController]
[Route("api/filters")]
public sealed class FiltersController : ControllerBase
{
    private readonly ISender _sender;
    public FiltersController(ISender sender) => _sender = sender;

    /// <summary>Returns all label categories and their labels, localized.</summary>
    /// <param name="langId">Language ID (1 = TR, 2 = EN)</param>
    [HttpGet]
    [ProducesResponseType(typeof(ApiResult<PlaceFiltersResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetFilters(
        [FromQuery] int langId = 1,
        CancellationToken ct = default)
    {
        var result = await _sender.Send(new GetPlaceFiltersQuery(langId), ct);
        return Ok(result);
    }
}
