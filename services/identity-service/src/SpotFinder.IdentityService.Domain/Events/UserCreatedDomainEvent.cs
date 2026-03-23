using SpotFinder.BuildingBlocks.Domain;

namespace SpotFinder.IdentityService.Domain.Events;

public sealed record UserCreatedDomainEvent(Guid UserId, string Email, string Username) : IDomainEvent
{
    public Guid EventId { get; } = Guid.NewGuid();
    public DateTime OccurredOn { get; } = DateTime.UtcNow;
}
