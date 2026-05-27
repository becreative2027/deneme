using SpotFinder.AdminService.Domain.Enums;
using SpotFinder.AdminService.Domain.Repositories;
using SpotFinder.BuildingBlocks.Application;

namespace SpotFinder.AdminService.Application.Features.Moderation.Queries.GetPendingItems;

public sealed class GetPendingModerationQueryHandler(
    IModerationRepository moderationRepository,
    IModerationEnrichmentService enrichment)
    : IQueryHandler<GetPendingModerationQuery, PagedResult<ModerationItemDto>>
{
    public async Task<PagedResult<ModerationItemDto>> Handle(GetPendingModerationQuery request, CancellationToken ct)
    {
        var result = await moderationRepository.GetPendingAsync(request.TargetType, request.Page, request.PageSize, ct);

        // Collect IDs to batch-fetch
        var postIds  = result.Items
            .Where(i => i.TargetType == ModerationTargetType.Post)
            .Select(i => i.TargetId)
            .Distinct()
            .ToList();

        var reporterIds = result.Items
            .Where(i => i.ReporterId is not null && Guid.TryParse(i.ReporterId, out _))
            .Select(i => Guid.Parse(i.ReporterId!))
            .Distinct()
            .ToList();

        // Fetch in parallel
        var postsTask   = postIds.Count   > 0 ? enrichment.GetPostsAsync(postIds, ct)   : Task.FromResult(new Dictionary<Guid, PostSummary>());
        var usersTask   = reporterIds.Count > 0 ? enrichment.GetUsersAsync(reporterIds, ct) : Task.FromResult(new Dictionary<Guid, UserSummary>());

        await Task.WhenAll(postsTask, usersTask);

        var posts = await postsTask;
        var users = await usersTask;

        // Also fetch post author users if not already included
        var authorIds = posts.Values.Select(p => p.AuthorId).Distinct().Except(reporterIds).ToList();
        if (authorIds.Count > 0)
        {
            var authorUsers = await enrichment.GetUsersAsync(authorIds, ct);
            foreach (var kv in authorUsers) users[kv.Key] = kv.Value;
        }

        var dtos = result.Items.Select(i =>
        {
            posts.TryGetValue(i.TargetId, out var postSummary);
            UserSummary? reporter = null;
            if (i.ReporterId is not null && Guid.TryParse(i.ReporterId, out var rid))
                users.TryGetValue(rid, out reporter);

            // Attach author info to post summary
            if (postSummary is not null && users.TryGetValue(postSummary.AuthorId, out var author))
                postSummary = postSummary with { AuthorUsername = author.Username, AuthorAvatarUrl = author.AvatarUrl };

            return new ModerationItemDto(
                i.Id, i.TargetType.ToString(), i.TargetId, i.Status.ToString(),
                i.ReporterId, i.ReporterNote, i.CreatedAt,
                postSummary, reporter);
        }).ToList();

        return PagedResult<ModerationItemDto>.Create(dtos, result.TotalCount, result.Page, result.PageSize);
    }
}
