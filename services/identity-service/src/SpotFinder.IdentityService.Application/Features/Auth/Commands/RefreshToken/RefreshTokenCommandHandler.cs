using MediatR;
using SpotFinder.BuildingBlocks.Application;
using SpotFinder.IdentityService.Domain.Entities;
using SpotFinder.IdentityService.Domain.Enums;
using SpotFinder.IdentityService.Domain.Repositories;
using SpotFinder.IdentityService.Domain.Services;

namespace SpotFinder.IdentityService.Application.Features.Auth.Commands.RefreshToken;

public sealed class RefreshTokenCommandHandler(
    IRefreshTokenRepository refreshTokenRepo,
    IUserRepository userRepo,
    IPlaceOwnershipRepository ownershipRepo,
    IJwtTokenService jwtService,
    IUnitOfWork unitOfWork)
    : IRequestHandler<RefreshTokenCommand, RefreshTokenResult>
{
    public async Task<RefreshTokenResult> Handle(RefreshTokenCommand request, CancellationToken ct)
    {
        var existing = await refreshTokenRepo.GetByTokenAsync(request.RefreshToken, ct)
            ?? throw new UnauthorizedAccessException("Invalid refresh token.");

        if (!existing.IsActive)
            throw new UnauthorizedAccessException("Refresh token is expired or revoked.");

        var user = await userRepo.GetByIdAsync(existing.UserId, ct)
            ?? throw new UnauthorizedAccessException("User not found.");

        if (!user.IsActive)
            throw new UnauthorizedAccessException("Account is deactivated.");

        // Revoke old token (rotation — single use)
        existing.Revoke();
        refreshTokenRepo.Update(existing);

        // Issue new pair
        List<Guid>? ownedPlaceIds = null;
        if (user.Role == UserRole.PlaceOwner)
            ownedPlaceIds = await ownershipRepo.GetPlaceIdsByUserAsync(user.Id, ct);

        var newAccessToken  = jwtService.GenerateAccessToken(user, ownedPlaceIds);
        var newRefreshValue = jwtService.GenerateRefreshToken();
        var newRefreshToken = Domain.Entities.RefreshToken.Create(user.Id, newRefreshValue, DateTime.UtcNow.AddDays(30));

        await refreshTokenRepo.AddAsync(newRefreshToken, ct);
        await unitOfWork.SaveChangesAsync(ct);

        return new RefreshTokenResult(newAccessToken, newRefreshValue, user.Id);
    }
}
