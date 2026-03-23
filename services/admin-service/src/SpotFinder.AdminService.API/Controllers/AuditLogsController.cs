using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpotFinder.AdminService.Application.Features.AuditLogs.Queries.GetAuditLogs;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.BuildingBlocks.Application;

namespace SpotFinder.AdminService.API.Controllers;

[Authorize(Roles = "Admin,SuperAdmin")]
public sealed class AuditLogsController : BaseController
{
    public AuditLogsController(ISender sender) : base(sender) { }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<PagedResult<AuditLogDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll(
        [FromQuery] Guid? adminId,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        CancellationToken ct = default)
        => OkResult(await Sender.Send(new GetAuditLogsQuery(adminId, page, pageSize), ct));
}
