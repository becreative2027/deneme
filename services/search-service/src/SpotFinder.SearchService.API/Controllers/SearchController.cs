using MediatR;
using Microsoft.AspNetCore.Mvc;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.BuildingBlocks.Application;
using SpotFinder.SearchService.Application.Features.Search.Queries.Autocomplete;
using SpotFinder.SearchService.Application.Features.Search.Queries.SearchPlaces;
using SpotFinder.SearchService.Domain.Models;

namespace SpotFinder.SearchService.API.Controllers;

public sealed class SearchController : BaseController
{
    public SearchController(ISender sender) : base(sender) { }

    [HttpGet("places")]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<PlaceSearchResultDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> SearchPlaces(
        [FromQuery] string? query,
        [FromQuery] Guid? cityId,
        [FromQuery] Guid? districtId,
        [FromQuery] List<Guid>? labelIds,
        [FromQuery] LabelMatchMode matchMode = LabelMatchMode.Any,
        [FromQuery] double? lat = null,
        [FromQuery] double? lon = null,
        [FromQuery] double? radius = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string lang = "en",
        CancellationToken ct = default)
    {
        var result = await Sender.Send(new SearchPlacesQuery(
            query, cityId, districtId, labelIds, matchMode, lat, lon, radius, page, pageSize, lang), ct);
        return OkResult(result);
    }

    [HttpGet("autocomplete")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<string>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> Autocomplete(
        [FromQuery] string query,
        [FromQuery] Guid? cityId,
        [FromQuery] string lang = "en",
        CancellationToken ct = default)
        => OkResult(await Sender.Send(new AutocompleteQuery(query, cityId, lang), ct));
}
