namespace SpotFinder.Contracts.Identity;
public record UserCreatedEvent(Guid UserId, string Email, string Username, DateTime CreatedAt);
