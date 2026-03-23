using MediatR;
namespace SpotFinder.BuildingBlocks.Domain;
public interface IDomainEvent : INotification
{
    Guid EventId { get; }
    DateTime OccurredOn { get; }
}
