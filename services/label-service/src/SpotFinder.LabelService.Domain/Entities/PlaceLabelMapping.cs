using SpotFinder.BuildingBlocks.Domain;

namespace SpotFinder.LabelService.Domain.Entities;

public sealed class PlaceLabelMapping : Entity<Guid>
{
    public Guid PlaceId { get; private set; }
    public Guid LabelId { get; private set; }
    public bool IsAiAssigned { get; private set; }
    public decimal? ConfidenceScore { get; private set; }
    public DateTime AssignedAt { get; private set; }

    private PlaceLabelMapping() { }

    public static PlaceLabelMapping Create(Guid placeId, Guid labelId, bool isAiAssigned = false, decimal? confidence = null)
        => new() { Id = Guid.NewGuid(), PlaceId = placeId, LabelId = labelId, IsAiAssigned = isAiAssigned, ConfidenceScore = confidence, AssignedAt = DateTime.UtcNow };
}
