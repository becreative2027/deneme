using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpotFinder.FeedService.Application.Features.Recommendations.Dtos;
using SpotFinder.FeedService.Application.Features.Recommendations.Queries.GetPlaceRecommendations;

namespace SpotFinder.FeedService.API.Controllers;

[ApiController]
[Route("api/places")]
[Authorize]
public sealed class RecommendationController : ControllerBase
{
    private readonly ISender _sender;
    public RecommendationController(ISender sender) => _sender = sender;

    // ── GET /api/places/recommendations?pageSize=10&debug=false ──────────────
    /// <summary>
    /// Returns places ranked by the calling user's interest profile + trending score.
    ///
    /// total_score = SUM(user_interest[label] × label_weight) + trend_score
    ///
    /// Phase 7.5 — Debug info control:
    ///   By default the response includes DebugInfo (RecommendationConfigSnapshot)
    ///   for Admin / SuperAdmin callers only.
    ///
    ///   Regular users always receive DebugInfo = null regardless of the flag.
    ///   Admin / SuperAdmin receive DebugInfo when ?debug=true (default: false).
    ///   This prevents leaking internal algorithm parameters to end users.
    ///
    /// Falls back to top-trending places for new users with no recorded interests.
    /// Cached 60 s per user.
    /// </summary>
    [HttpGet("recommendations")]
    public async Task<IActionResult> GetRecommendations(
        [FromQuery] int  pageSize = 10,
        [FromQuery] bool debug    = false,
        CancellationToken ct      = default)
    {
        var userId = GetUserId();
        if (userId == Guid.Empty) return Unauthorized();

        if (pageSize is < 1 or > 50)
            return BadRequest("pageSize must be between 1 and 50.");

        var result = await _sender.Send(new GetPlaceRecommendationsQuery(userId, pageSize), ct);

        if (!result.IsSuccess)
            return BadRequest(result.Errors);

        var response = result.Data!;

        // Phase 7.5 — Controlled debug info exposure:
        //   Only surface DebugInfo when the caller is an Admin/SuperAdmin AND
        //   has explicitly requested debug output via ?debug=true.
        //   All other callers receive DebugInfo = null.
        var isAdminCaller = User.IsInRole("Admin") || User.IsInRole("SuperAdmin");
        if (!debug || !isAdminCaller)
        {
            response = response with { DebugInfo = null };
        }

        return Ok(response);
    }

    private Guid GetUserId()
    {
        var claim = User.FindFirst(ClaimTypes.NameIdentifier)
                 ?? User.FindFirst("sub")
                 ?? User.FindFirst("nameid");
        return claim is not null && Guid.TryParse(claim.Value, out var id) ? id : Guid.Empty;
    }
}
