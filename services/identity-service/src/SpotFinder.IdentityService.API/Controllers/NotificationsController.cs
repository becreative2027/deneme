using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.IdentityService.Domain.Entities;
using SpotFinder.IdentityService.Infrastructure.Persistence;

namespace SpotFinder.IdentityService.API.Controllers;

[Authorize]
public sealed class NotificationsController : BaseController
{
    private readonly IdentityDbContext _ctx;

    public NotificationsController(ISender sender, IdentityDbContext ctx) : base(sender)
        => _ctx = ctx;

    /// <summary>Registers or refreshes the Expo push token for the current user's device.</summary>
    [HttpPost("register-device")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> RegisterDevice(
        [FromBody] RegisterDeviceRequest request,
        CancellationToken ct)
    {
        if (string.IsNullOrWhiteSpace(request.Token)) return BadRequest();

        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var existing = await _ctx.PushTokens
            .FirstOrDefaultAsync(t => t.Token == request.Token, ct);

        if (existing is null)
        {
            await _ctx.PushTokens.AddAsync(new PushToken
            {
                UserId   = userId,
                Token    = request.Token,
                Platform = request.Platform ?? "ios",
            }, ct);
        }
        else
        {
            // Re-associate token with current user (device handed to someone else)
            existing.UserId = userId;
        }

        await _ctx.SaveChangesAsync(ct);
        return NoContent();
    }

    /// <summary>Returns Expo push tokens for a list of user IDs (internal/admin use).</summary>
    [HttpPost("tokens-by-users")]
    [Authorize(Roles = "Admin,SuperAdmin,PlaceOwner")]
    [ProducesResponseType(typeof(IReadOnlyList<string>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetTokensByUsers(
        [FromBody] TokensByUsersRequest request,
        CancellationToken ct)
    {
        if (request.UserIds is null || request.UserIds.Count == 0)
            return Ok(Array.Empty<string>());

        var tokens = await _ctx.PushTokens
            .Where(t => request.UserIds.Contains(t.UserId))
            .Select(t => t.Token)
            .ToListAsync(ct);

        return Ok(tokens);
    }
}

public sealed record RegisterDeviceRequest(string Token, string? Platform);
public sealed record TokensByUsersRequest(IReadOnlyList<Guid> UserIds);
