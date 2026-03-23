using MediatR;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.ContentService.Application.Features.Events.Commands.RecordDwell;

/// <summary>
/// Records a dwell-time event for a post.
///
/// Phase 7.2 — foundation for the dwell-time signal pipeline.
/// The event is stored in <c>content.user_events</c> with
/// <c>event_type = 'dwell'</c> and a JSONB payload containing the duration.
///
/// Scoring integration is deferred to a future phase; this phase only
/// ingests and stores the signal.
/// </summary>
/// <param name="UserId">From JWT — never from client payload.</param>
/// <param name="PostId">The post that was viewed.</param>
/// <param name="DurationMs">Milliseconds the post was visible in the viewport.</param>
public record RecordDwellCommand(Guid UserId, Guid PostId, int DurationMs)
    : IRequest<ApiResult<bool>>;
