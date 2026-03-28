using MediatR;
using SpotFinder.IdentityService.Application.Features.Users.Queries.GetUserById;
using SpotFinder.IdentityService.Domain.Repositories;

namespace SpotFinder.IdentityService.Application.Features.Users.Queries.GetUsersByIds;

public sealed class GetUsersByIdsQueryHandler(
    IUserRepository userRepository,
    IUserProfileRepository profileRepository)
    : IRequestHandler<GetUsersByIdsQuery, IReadOnlyList<UserDto>>
{
    public async Task<IReadOnlyList<UserDto>> Handle(GetUsersByIdsQuery request, CancellationToken ct)
    {
        if (request.UserIds.Count == 0) return [];

        var users = await userRepository.GetByIdsAsync(request.UserIds, ct);
        var profiles = await profileRepository.GetByUserIdsAsync(request.UserIds, ct);
        var profileMap = profiles.ToDictionary(p => p.UserId);

        return users.Select(u =>
        {
            profileMap.TryGetValue(u.Id, out var profile);
            return new UserDto(
                u.Id, u.Email, u.Username, u.Role.ToString(), u.IsActive, u.CreatedAt,
                profile?.DisplayName, profile?.Bio, profile?.ProfileImageUrl);
        }).ToList();
    }
}
