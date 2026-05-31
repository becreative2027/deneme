using FluentValidation;
using MediatR;
using Microsoft.AspNetCore.Mvc;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.PlaceService.Application.Features.Analytics.Queries.GetPlaceAnalytics;
using SpotFinder.PlaceService.Application.Features.Events.Queries.GetPlaceEvents;
using SpotFinder.PlaceService.Application.Features.Places.Commands.AddOrUpdateReview;
using SpotFinder.PlaceService.Application.Features.Places.Commands.CreatePlace;
using SpotFinder.PlaceService.Application.Features.Places.Commands.DeleteReview;
using SpotFinder.PlaceService.Application.Features.Places.Commands.TrackPlaceView;
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

    /// <summary>Track that a user viewed a place detail page (interest signal + analytics).</summary>
    [HttpPost("{id:guid}/view")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> TrackView(Guid id, [FromBody] TrackViewRequest req, CancellationToken ct)
    {
        await Sender.Send(new TrackPlaceViewCommand(req.UserId, id, req.DurationSeconds), ct);
        return NoContent();
    }

    /// <summary>
    /// Get view analytics for a place (owner/admin only).
    /// Pass ?hours=6 for hourly mode, or ?days=30 for daily mode.
    /// </summary>
    [HttpGet("{id:guid}/analytics")]
    [ProducesResponseType(typeof(ApiResult<PlaceAnalyticsResponse>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAnalytics(
        Guid id,
        [FromQuery] int days  = 30,
        [FromQuery] int hours = 0,
        CancellationToken ct  = default)
    {
        var result = await Sender.Send(new GetPlaceAnalyticsQuery(id, days, hours), ct);
        return Ok(result);
    }

    /// <summary>Get upcoming events for a place.</summary>
    [HttpGet("{id:guid}/events")]
    [ProducesResponseType(typeof(IReadOnlyList<PlaceEventDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetEvents(
        Guid id,
        [FromQuery] bool includePast = false,
        CancellationToken ct = default)
    {
        var result = await Sender.Send(new GetPlaceEventsQuery(id, includePast), ct);
        return Ok(result);
    }

    /// <summary>Admin: Delete a review by id.</summary>
    [HttpDelete("{id:guid}/reviews/{reviewId:guid}")]
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

public sealed record TrackViewRequest(Guid UserId, int? DurationSeconds = null);
