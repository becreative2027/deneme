using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SpotFinder.ContentService.Infrastructure.Persistence;

namespace SpotFinder.ContentService.API.Controllers;

/// <summary>
/// Internal-only endpoints called by admin-service after moderation approval.
/// No JWT required — only reachable from within the cluster (no gateway route).
/// </summary>
[Route("api/internal/posts")]
[ApiController]
public sealed class InternalPostsController : ControllerBase
{
    private readonly ContentDbContext _db;
    public InternalPostsController(ContentDbContext db) => _db = db;

    [HttpDelete("{id:guid}")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken ct)
    {
        var post = await _db.Posts.IgnoreQueryFilters().FirstOrDefaultAsync(p => p.Id == id, ct);
        if (post is null) return NotFound();

        post.IsDeleted = true;
        post.Status    = "removed";
        post.ModeratedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync(ct);
        return NoContent();
    }
}
