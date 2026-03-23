namespace SpotFinder.ContentService.Infrastructure.Abstractions;

/// <summary>
/// Updates the per-user label interest scores that drive personalized feed and recommendations.
/// Implementations must resolve the place's labels and upsert one row per label.
/// </summary>
public interface IUserInterestService
{
    /// <param name="userId">The acting user.</param>
    /// <param name="placeId">The place the user interacted with.</param>
    /// <param name="weight">
    ///   Interest delta to apply per label on the place.
    ///   Positive = increase interest; negative = decrease (floored at 0 by the implementation).
    /// </param>
    Task UpdateAsync(
        Guid    userId,
        Guid    placeId,
        decimal weight,
        CancellationToken ct = default);
}
