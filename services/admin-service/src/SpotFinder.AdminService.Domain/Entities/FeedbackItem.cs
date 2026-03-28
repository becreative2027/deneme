using SpotFinder.AdminService.Domain.Enums;
using SpotFinder.BuildingBlocks.Domain;

namespace SpotFinder.AdminService.Domain.Entities;

public sealed class FeedbackItem : AggregateRoot<Guid>
{
    public FeedbackCategory Category   { get; private set; }
    public string           Message    { get; private set; } = default!;
    public string?          UserId     { get; private set; }
    public string?          UserEmail  { get; private set; }
    public bool             IsReviewed { get; private set; }
    public DateTime         CreatedAt  { get; private set; }

    private FeedbackItem() { }

    public static FeedbackItem Create(
        Guid id,
        FeedbackCategory category,
        string message,
        string? userId,
        string? userEmail)
        => new()
        {
            Id         = id,
            Category   = category,
            Message    = message,
            UserId     = userId,
            UserEmail  = userEmail,
            IsReviewed = false,
            CreatedAt  = DateTime.UtcNow,
        };

    public void MarkReviewed() => IsReviewed = true;
}
