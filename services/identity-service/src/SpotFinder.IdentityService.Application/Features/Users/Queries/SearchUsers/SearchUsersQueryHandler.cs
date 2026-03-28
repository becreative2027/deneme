using MediatR;
using SpotFinder.IdentityService.Domain.Repositories;

namespace SpotFinder.IdentityService.Application.Features.Users.Queries.SearchUsers;

public sealed class SearchUsersQueryHandler(
    IUserRepository userRepository,
    IUserProfileRepository profileRepository)
    : IRequestHandler<SearchUsersQuery, SearchUsersResponse>
{
    public async Task<SearchUsersResponse> Handle(SearchUsersQuery request, CancellationToken ct)
    {
        var pageSize = Math.Clamp(request.PageSize, 1, 50);
        var page     = Math.Max(request.Page, 1);

        var (users, total) = await userRepository.SearchByUsernameAsync(
            request.Query, page, pageSize, ct);

        if (users.Count == 0)
            return new SearchUsersResponse([], 0, page, pageSize);

        var userIds  = users.Select(u => u.Id).ToList();
        var profiles = await profileRepository.GetByUserIdsAsync(userIds, ct);
        var profileMap = profiles.ToDictionary(p => p.UserId);

        var dtos = users.Select(u =>
        {
            profileMap.TryGetValue(u.Id, out var profile);
            return new UserSummaryDto(
                u.Id,
                u.Username,
                profile?.DisplayName,
                profile?.ProfileImageUrl);
        }).ToList();

        return new SearchUsersResponse(dtos, total, page, pageSize);
    }
}
