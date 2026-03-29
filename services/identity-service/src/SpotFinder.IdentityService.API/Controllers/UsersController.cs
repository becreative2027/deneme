using System.Security.Claims;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.BuildingBlocks.Application;
using SpotFinder.IdentityService.Application.Features.Users.Commands.UpdateProfile;
using SpotFinder.IdentityService.Application.Features.Users.Queries.GetUserById;
using SpotFinder.IdentityService.Application.Features.Users.Queries.GetUsersByIds;
using SpotFinder.IdentityService.Application.Features.Users.Queries.SearchUsers;
using SpotFinder.IdentityService.Domain.Entities;
using SpotFinder.IdentityService.Domain.Enums;
using SpotFinder.IdentityService.Domain.Repositories;
using SpotFinder.IdentityService.Domain.Services;

namespace SpotFinder.IdentityService.API.Controllers;

[Authorize]
public sealed class UsersController : BaseController
{
    private readonly IUserRepository _userRepository;
    private readonly IPlaceOwnershipRepository _ownershipRepository;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IPasswordHasher _passwordHasher;

    public UsersController(ISender sender, IUserRepository userRepository, IPlaceOwnershipRepository ownershipRepository, IUnitOfWork unitOfWork, IPasswordHasher passwordHasher)
        : base(sender)
    {
        _userRepository = userRepository;
        _ownershipRepository = ownershipRepository;
        _unitOfWork = unitOfWork;
        _passwordHasher = passwordHasher;
    }

    [HttpGet("search")]
    [ProducesResponseType(typeof(SearchUsersResponse), StatusCodes.Status200OK)]
    public async Task<IActionResult> Search(
        [FromQuery] string q,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(q) || q.Trim().Length < 2)
            return Ok(new SearchUsersResponse([], 0, page, pageSize));

        var result = await Sender.Send(new SearchUsersQuery(q, page, pageSize), ct);
        return Ok(result);
    }

    [HttpGet("me")]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetMe(CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var result = await Sender.Send(new GetUserByIdQuery(userId), ct);
        return result is null ? NotFound() : OkResult(result);
    }

    [HttpGet("{id:guid}")]
    [ProducesResponseType(typeof(ApiResponse<UserDto>), StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GetById(Guid id, CancellationToken ct)
    {
        var result = await Sender.Send(new GetUserByIdQuery(id), ct);
        return result is null ? NotFound() : OkResult(result);
    }

    [HttpPost("batch")]
    [ProducesResponseType(typeof(IReadOnlyList<UserDto>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByIds([FromBody] BatchUsersRequest request, CancellationToken ct)
    {
        var result = await Sender.Send(new GetUsersByIdsQuery(request.Ids), ct);
        return Ok(result);
    }

    [HttpPut("profile")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request, CancellationToken ct)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var cmd = new UpdateProfileCommand(userId, request.DisplayName, request.Bio, request.ProfileImageUrl);
        await Sender.Send(cmd, ct);
        return NoContent();
    }

    // ── Place Ownership Management (Admin/SuperAdmin only) ────────────────

    [HttpPost("ownership")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> GrantOwnership([FromBody] GrantOwnershipRequest request, CancellationToken ct)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, ct);
        if (user is null) return NotFound("User not found.");

        // Promote user to PlaceOwner role if they are a regular User
        if (user.Role == UserRole.User)
        {
            user.SetRole(UserRole.PlaceOwner);
        }

        var ownership = PlaceOwnership.Grant(request.UserId, request.PlaceId,
            Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!));
        await _ownershipRepository.AddAsync(ownership, ct);
        await _unitOfWork.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpDelete("ownership/{userId:guid}/{placeId:guid}")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> RevokeOwnership(Guid userId, Guid placeId, CancellationToken ct)
    {
        await _ownershipRepository.RemoveAsync(userId, placeId, ct);
        await _unitOfWork.SaveChangesAsync(ct);
        return NoContent();
    }

    [HttpPost("place-owner")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    [ProducesResponseType(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status409Conflict)]
    public async Task<IActionResult> CreatePlaceOwner([FromBody] CreatePlaceOwnerRequest request, CancellationToken ct)
    {
        // Her mekana yalnızca 1 admin atanabilir
        var existing = await _ownershipRepository.GetByPlaceIdAsync(request.PlaceId, ct);
        if (existing.Count > 0)
            return Conflict(new { message = "Bu mekanın zaten bir admin hesabı var." });

        if (await _userRepository.ExistsByEmailAsync(request.Email, ct))
            return Conflict(new { message = "Bu e-posta adresi zaten kullanımda." });

        if (await _userRepository.ExistsByUsernameAsync(request.Username, ct))
            return Conflict(new { message = "Bu kullanıcı adı zaten alınmış." });

        var passwordHash = _passwordHasher.Hash(request.Password);
        var newUser = Domain.Entities.User.Create(Guid.NewGuid(), request.Email, request.Username, passwordHash);
        newUser.SetRole(UserRole.PlaceOwner);

        await _userRepository.AddAsync(newUser, ct);

        var grantedBy = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var ownership = PlaceOwnership.Grant(newUser.Id, request.PlaceId, grantedBy);
        await _ownershipRepository.AddAsync(ownership, ct);

        await _unitOfWork.SaveChangesAsync(ct);

        return Ok(new { userId = newUser.Id, email = newUser.Email });
    }

    [HttpGet("ownership/owned-place-ids")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    [ProducesResponseType(typeof(List<Guid>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAllOwnedPlaceIds(CancellationToken ct)
    {
        var ids = await _ownershipRepository.GetAllOwnedPlaceIdsAsync(ct);
        return Ok(ids);
    }

    [HttpGet("{userId:guid}/owned-places")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    [ProducesResponseType(typeof(List<Guid>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetOwnedPlaces(Guid userId, CancellationToken ct)
    {
        var placeIds = await _ownershipRepository.GetPlaceIdsByUserAsync(userId, ct);
        return Ok(placeIds);
    }

    [HttpPut("{userId:guid}/role")]
    [Authorize(Roles = "Admin,SuperAdmin")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> SetRole(Guid userId, [FromBody] SetRoleRequest request, CancellationToken ct)
    {
        var user = await _userRepository.GetByIdAsync(userId, ct);
        if (user is null) return NotFound("User not found.");
        user.SetRole(request.Role);
        await _unitOfWork.SaveChangesAsync(ct);
        return NoContent();
    }
}

public sealed record BatchUsersRequest(IReadOnlyList<Guid> Ids);
public sealed record UpdateProfileRequest(string? DisplayName, string? Bio, string? ProfileImageUrl);
public sealed record GrantOwnershipRequest(Guid UserId, Guid PlaceId);
public sealed record SetRoleRequest(UserRole Role);
public sealed record CreatePlaceOwnerRequest(string Email, string Username, string Password, Guid PlaceId);
