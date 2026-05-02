namespace SpotFinder.SocialGraphService.Application.Abstractions;

/// <summary>
/// Writes user interest signals into the shared content.user_interests table.
/// </summary>
public interface IUserInterestWriter
{
    Task UpdateAsync(Guid userId, Guid placeId, decimal weight, CancellationToken ct = default);
}
