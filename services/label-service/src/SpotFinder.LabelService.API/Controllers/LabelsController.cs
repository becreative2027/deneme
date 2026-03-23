using MediatR;
using Microsoft.AspNetCore.Mvc;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.LabelService.Application.Features.Labels.Queries.GetLabelsByCategory;
using SpotFinder.LabelService.Application.Features.PlaceLabels.Commands.AssignLabelToPlace;

namespace SpotFinder.LabelService.API.Controllers;

public sealed class LabelsController : BaseController
{
    public LabelsController(ISender sender) : base(sender) { }

    [HttpGet("by-category/{categoryId:int}")]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<LabelDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetByCategory(int categoryId, [FromQuery] int langId = 1, CancellationToken ct = default)
        => OkResult(await Sender.Send(new GetLabelsByCategoryQuery(categoryId, langId), ct));

    [HttpPost("assign")]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    public async Task<IActionResult> Assign([FromBody] AssignLabelToPlaceCommand command, CancellationToken ct)
    {
        await Sender.Send(command, ct);
        return NoContent();
    }
}
