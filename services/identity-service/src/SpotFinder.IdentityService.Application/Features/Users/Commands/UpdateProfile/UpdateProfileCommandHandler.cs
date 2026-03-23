using System.Diagnostics;
using Microsoft.Extensions.Logging;
using SpotFinder.BuildingBlocks.Application;
using SpotFinder.IdentityService.Domain.Entities;
using SpotFinder.IdentityService.Domain.Repositories;

namespace SpotFinder.IdentityService.Application.Features.Users.Commands.UpdateProfile;

public sealed class UpdateProfileCommandHandler(
    IUserProfileRepository profileRepository,
    IUnitOfWork            unitOfWork,
    ILogger<UpdateProfileCommandHandler> logger)
    : ICommandHandler<UpdateProfileCommand, bool>
{
    public async Task<bool> Handle(UpdateProfileCommand cmd, CancellationToken ct)
    {
        var sw = Stopwatch.StartNew();

        var profile = await profileRepository.GetByUserIdAsync(cmd.UserId, ct);
        var isNew = profile is null;

        if (isNew)
        {
            // Upsert: create profile on first update
            profile = new UserProfile { UserId = cmd.UserId };
            await profileRepository.AddAsync(profile, ct);
        }

        if (cmd.DisplayName != null)     profile!.DisplayName     = cmd.DisplayName;
        if (cmd.Bio != null)             profile!.Bio             = cmd.Bio;
        if (cmd.ProfileImageUrl != null) profile!.ProfileImageUrl = cmd.ProfileImageUrl;

        profile!.UpdatedAt = DateTime.UtcNow;

        if (!isNew) profileRepository.Update(profile);
        await unitOfWork.SaveChangesAsync(ct);

        sw.Stop();
        logger.LogInformation(
            "UpdateProfile — userId={UserId} profile updated, totalTime={TotalMs} ms.",
            cmd.UserId, sw.ElapsedMilliseconds);

        return true;
    }
}
