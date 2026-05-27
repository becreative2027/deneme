using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using SpotFinder.AdminService.Domain.Repositories;
using SpotFinder.AdminService.Infrastructure.Persistence;
using SpotFinder.AdminService.Infrastructure.Services;

namespace SpotFinder.AdminService.Application.Features.Feedback.Commands.RespondToFeedback;

public sealed class RespondToFeedbackCommandHandler(
    IFeedbackRepository feedbackRepo,
    AdminDbContext db,
    IExpoPushService pushService,
    ILogger<RespondToFeedbackCommandHandler> logger)
    : IRequestHandler<RespondToFeedbackCommand>
{
    public async Task Handle(RespondToFeedbackCommand cmd, CancellationToken ct)
    {
        var feedback = await feedbackRepo.GetByIdAsync(cmd.FeedbackId, ct)
            ?? throw new KeyNotFoundException($"Feedback {cmd.FeedbackId} not found.");

        // Mark reviewed and save
        feedback.MarkReviewed();
        feedbackRepo.Update(feedback);
        await db.SaveChangesAsync(ct);

        // Send push notification if user has a registered device
        if (!string.IsNullOrWhiteSpace(feedback.UserId) && Guid.TryParse(feedback.UserId, out var userId))
        {
            var tokens = await db.Database
                .SqlQueryRaw<string>(
                    "SELECT token FROM identity.push_tokens WHERE user_id = @userId",
                    new Npgsql.NpgsqlParameter("userId", userId))
                .ToListAsync(ct);

            if (tokens.Count > 0)
            {
                await pushService.SendAsync(
                    tokens,
                    title: "SpotFinder'dan yanıt 📬",
                    body:  cmd.Message,
                    type:  "admin_response",
                    ct:    ct);

                logger.LogInformation(
                    "Feedback response sent — userId={UserId} devices={Count} message={Message}",
                    userId, tokens.Count, cmd.Message);
            }
            else
            {
                logger.LogWarning(
                    "No push tokens for userId={UserId}, feedback {FeedbackId} marked reviewed without notification.",
                    userId, cmd.FeedbackId);
            }
        }
    }
}
