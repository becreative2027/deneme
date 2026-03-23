using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SpotFinder.AdminService.Application.Features.Labels.Commands.Assign;
using SpotFinder.AdminService.Application.Features.Labels.Commands.Create;
using SpotFinder.AdminService.Application.Features.Labels.Commands.Update;
using SpotFinder.BuildingBlocks.Api;

namespace SpotFinder.AdminService.API.Controllers;

[Authorize(Roles = "Admin,SuperAdmin")]
[Route("api/admin/labels")]
public sealed class AdminLabelsController : BaseController
{
    public AdminLabelsController(ISender sender) : base(sender) { }

    [HttpPost]
    [ProducesResponseType(typeof(ApiResponse<int>), StatusCodes.Status201Created)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Create([FromBody] AdminCreateLabelCommand cmd, CancellationToken ct)
    {
        var result = await Sender.Send(cmd, ct);
        if (!result.IsSuccess)
            return FailResult(string.Join("; ", result.Errors));

        return CreatedAtAction(nameof(Create), new { id = result.Data }, ApiResponse<int>.Ok(result.Data));
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Update(int id, [FromBody] AdminUpdateLabelRequest request, CancellationToken ct)
    {
        var result = await Sender.Send(new AdminUpdateLabelCommand(id, request.Key, request.IsActive, request.UpdatedBy), ct);
        if (!result.IsSuccess)
            return FailResult(string.Join("; ", result.Errors));

        return NoContent();
    }

    [HttpPost("{id:int}/places/{placeId:guid}")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> Assign(int id, Guid placeId, [FromBody] AssignLabelRequest request, CancellationToken ct)
    {
        var result = await Sender.Send(
            new AdminAssignLabelToPlaceCommand(placeId, id, request.Weight, request.CreatedBy), ct);

        if (!result.IsSuccess)
            return FailResult(string.Join("; ", result.Errors));

        return NoContent();
    }
}

public sealed record AdminUpdateLabelRequest(string? Key, bool? IsActive, string? UpdatedBy);
public sealed record AssignLabelRequest(decimal Weight = 1.0m, string? CreatedBy = null);
