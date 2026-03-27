using MediatR;
using SpotFinder.IdentityService.Application.Features.Users.Queries.GetUserById;

namespace SpotFinder.IdentityService.Application.Features.Users.Queries.GetUsersByIds;

public sealed record GetUsersByIdsQuery(IReadOnlyList<Guid> UserIds) : IRequest<IReadOnlyList<UserDto>>;
