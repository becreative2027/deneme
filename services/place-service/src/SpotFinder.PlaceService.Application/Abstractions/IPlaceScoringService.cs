namespace SpotFinder.PlaceService.Application.Abstractions;

/// <summary>
/// Recalculates quality, popularity, trend and final scores for all active places.
/// Intended to be called from a background job on a periodic schedule.
/// </summary>
public interface IPlaceScoringService
{
    /// <summary>
    /// Runs a full scoring pass over all non-deleted places.
    /// Returns the number of place scores written.
    /// </summary>
    Task<int> RecalculateAllAsync(CancellationToken ct = default);
}
