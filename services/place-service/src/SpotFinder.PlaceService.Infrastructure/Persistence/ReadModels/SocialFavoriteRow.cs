namespace SpotFinder.PlaceService.Infrastructure.Persistence.ReadModels;

public sealed class SocialFavoriteRow
{
    public Guid UserId { get; set; }
    public Guid PlaceId { get; set; }
}
