namespace SpotFinder.IdentityService.Domain.Entities;

/// <summary>
/// Links a PlaceOwner user to the place(s) they can manage.
/// A single user may own multiple places; a place may have multiple owners.
/// </summary>
public sealed class PlaceOwnership
{
    public int Id { get; private set; }
    public Guid UserId { get; private set; }
    public Guid PlaceId { get; private set; }
    public DateTime GrantedAt { get; private set; }
    public Guid? GrantedBy { get; private set; }

    private PlaceOwnership() { }

    public static PlaceOwnership Grant(Guid userId, Guid placeId, Guid? grantedBy = null) =>
        new() { UserId = userId, PlaceId = placeId, GrantedAt = DateTime.UtcNow, GrantedBy = grantedBy };
}
