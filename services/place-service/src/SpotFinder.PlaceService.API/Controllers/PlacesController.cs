using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.PlaceService.Application.Features.Places.Commands.AddOrUpdateReview;
using SpotFinder.PlaceService.Application.Features.Places.Commands.CreatePlace;
using SpotFinder.PlaceService.Application.Features.Places.Commands.DeleteReview;
using SpotFinder.PlaceService.Application.Features.Places.Queries.GetPlaceById;
using SpotFinder.PlaceService.Application.Features.Places.Queries.GetPlaceDetail;
using SpotFinder.PlaceService.Application.Features.Places.Queries.GetPlaceReviews;
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

    /// <summary>Add or update the current user's review for a place.</summary>
    [HttpPost("{id:guid}/reviews")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> AddReview(Guid id, [FromBody] AddReviewRequest request, CancellationToken ct)
    {
        if (request.Rating < 1 || request.Rating > 5)
            return BadRequest("Rating must be between 1 and 5.");

        await Sender.Send(new AddOrUpdateReviewCommand(
            id, request.UserId, request.Username, request.DisplayName,
            request.AvatarUrl, request.Rating, request.Comment), ct);

        return Ok();
    }

    /// <summary>Get paginated reviews for a place.</summary>
    [HttpGet("{id:guid}/reviews")]
    [ProducesResponseType(typeof(PlaceReviewsResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetReviews(
        Guid id,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        var result = await Sender.Send(new GetPlaceReviewsQuery(id, page, pageSize), ct);
        return Ok(result);
    }

    /// <summary>Admin: Delete a review by id.</summary>
    [HttpDelete("{id:guid}/reviews/{reviewId:guid}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> DeleteReview(Guid id, Guid reviewId, CancellationToken ct)
    {
        var deleted = await Sender.Send(new DeleteReviewCommand(id, reviewId), ct);
        return deleted ? NoContent() : NotFound();
    }
}

public sealed record AddReviewRequest(
    Guid UserId,
    string Username,
    string DisplayName,
    string? AvatarUrl,
    int Rating,
    string? Comment);
