using MediatR;

namespace SpotFinder.IdentityService.Application.Features.Users.Queries.SearchUsers;

public sealed record SearchUsersQuery(string Query, int Page, int PageSize)
    : IRequest<SearchUsersResponse>;

public sealed record SearchUsersResponse(
    IReadOnlyList<UserSummaryDto> Users,
    int TotalCount,
    int Page,
    int PageSize);

public sealed record UserSummaryDto(
    Guid Id,
    string Username,
    string? DisplayName,
    string? AvatarUrl);
