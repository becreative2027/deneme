using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.PlaceService.Application.Features.Places.Commands.CreatePlace;
using SpotFinder.PlaceService.Application.Features.Places.Queries.GetPlaceById;
using SpotFinder.PlaceService.Application.Features.Places.Queries.GetPlaceDetail;
using SpotFinder.PlaceService.Application.Features.Places.Queries.SearchPlaces;

namespace SpotFinder.PlaceService.API.Controllers;

public sealed class PlacesController : BaseController
{
    private readonly IValidator<SearchPlacesQuery> _searchValidator;
    private readonly IValidator<GetPlaceDetailQuery> _detailValidator;

    public PlacesController(
        ISender sender,
        IValidator<SearchPlacesQuery> searchValidator,
        IValidator<GetPlaceDetailQuery> detailValidator)
        : base(sender)
    {
        _searchValidator = searchValidator;
        _detailValidator = detailValidator;
    }

    /// <summary>Search places with geo, label and rating filters.</summary>
    [HttpPost("search")]
    [ProducesResponseType(typeof(ApiResult<SearchPlacesResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResult<SearchPlacesResponse>), StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Search(
        [FromBody] SearchPlacesQuery query,
        CancellationToken ct)
    {
        var validation = await _searchValidator.ValidateAsync(query, ct);
        if (!validation.IsValid)
            return BadRequest(ApiResult<SearchPlacesResponse>.Fail(
                validation.Errors.Select(e => e.ErrorMessage).ToArray()));

        var result = await Sender.Send(query, ct);
        return Ok(result);
    }

    /// <summary>Get full place detail including labels and scores.</summary>
    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResult<PlaceDetailResponse>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiResult<PlaceDetailResponse>), StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetDetail(
        Guid id,
        [FromQuery] int langId = 1,
        CancellationToken ct = default)
    {
        var query      = new GetPlaceDetailQuery(id, langId);
        var validation = await _detailValidator.ValidateAsync(query, ct);
        if (!validation.IsValid)
            return BadRequest(ApiResult<PlaceDetailResponse>.Fail(
                validation.Errors.Select(e => e.ErrorMessage).ToArray()));

        var result = await Sender.Send(query, ct);
        return result.IsSuccess ? Ok(result) : NotFound(result);
    }

    /// <summary>Create a new place (command side).</summary>
    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<Guid>), StatusCodes.Status201Created)]
    public async Task<IActionResult> Create([FromBody] CreatePlaceCommand command, CancellationToken ct)
    {
        var id = await Sender.Send(command, ct);
        return StatusCode(StatusCodes.Status201Created, ApiResponse<Guid>.Ok(id));
    }
}
