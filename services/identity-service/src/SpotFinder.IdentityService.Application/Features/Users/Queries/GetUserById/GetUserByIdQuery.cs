using SpotFinder.BuildingBlocks.Application;

namespace SpotFinder.IdentityService.Application.Features.Users.Queries.GetUserById;

public sealed record GetUserByIdQuery(Guid UserId) : IQuery<UserDto?>;
public sealed record UserDto(
    Guid Id, string Email, string Username, string Role, bool IsActive, DateTime CreatedAt,
    string? DisplayName, string? Bio, string? ProfileImageUrl);
