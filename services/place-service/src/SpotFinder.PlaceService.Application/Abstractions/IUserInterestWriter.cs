namespace SpotFinder.PlaceService.Application.Abstractions;

/// <summary>
/// Writes user interest signals into the shared interest table.
/// Implemented in the infrastructure layer; injected into command handlers.
/// </summary>
public interface IUserInterestWriter
{
    /// <summary>
    /// Increments (or decrements for negative weight) the user's interest score
    /// for all labels associated with the given place.
    /// </summary>
    Task UpdateAsync(Guid userId, Guid placeId, decimal weight, CancellationToken ct = default);
}
