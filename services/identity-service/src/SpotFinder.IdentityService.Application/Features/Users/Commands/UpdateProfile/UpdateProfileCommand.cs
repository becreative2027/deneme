using SpotFinder.BuildingBlocks.Application;

namespace SpotFinder.IdentityService.Application.Features.Users.Commands.UpdateProfile;

public sealed record UpdateProfileCommand(
    Guid    UserId,
    string? DisplayName,
    string? Bio,
    string? ProfileImageUrl)
    : ICommand<bool>;
