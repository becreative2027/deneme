using SpotFinder.BuildingBlocks.Application;
using SpotFinder.IdentityService.Domain.Repositories;

namespace SpotFinder.IdentityService.Application.Features.Users.Queries.GetUserById;

public sealed class GetUserByIdQueryHandler : IQueryHandler<GetUserByIdQuery, UserDto?>
{
    private readonly IUserRepository _userRepository;

    public GetUserByIdQueryHandler(IUserRepository userRepository) => _userRepository = userRepository;

    public async Task<UserDto?> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
    {
        var user = await _userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user is null) return null;
        return new UserDto(user.Id, user.Email, user.Username, user.Role.ToString(), user.IsActive, user.CreatedAt);
    }
}
