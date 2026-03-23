using SpotFinder.LabelService.Domain.Entities;

namespace SpotFinder.LabelService.Domain.Repositories;

public interface IPlaceLabelRepository
{
    Task<IReadOnlyList<PlaceLabel>> GetByPlaceIdAsync(Guid placeId, CancellationToken ct = default);
    Task AddAsync(PlaceLabel placeLabel, CancellationToken ct = default);
    Task RemoveAsync(Guid placeId, int labelId, CancellationToken ct = default);
}
