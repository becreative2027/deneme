namespace SpotFinder.PlaceService.Domain.Services;

/// <summary>
/// Recalculates quality, popularity, trend and final scores for all active places.
/// Intended to be called from a background job on a periodic schedule.
/// </summary>
public interface IPlaceScoringService
{
    Task<int> RecalculateAllAsync(CancellationToken ct = default);
}
