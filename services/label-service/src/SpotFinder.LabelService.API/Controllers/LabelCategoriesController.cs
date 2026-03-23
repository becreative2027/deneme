using MediatR;
using Microsoft.AspNetCore.Mvc;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.LabelService.Application.Features.Categories.Queries.GetAllCategories;

namespace SpotFinder.LabelService.API.Controllers;

public sealed class LabelCategoriesController : BaseController
{
    public LabelCategoriesController(ISender sender) : base(sender) { }

    [HttpGet]
    [ProducesResponseType(typeof(ApiResponse<IReadOnlyList<CategoryDto>>), StatusCodes.Status200OK)]
    public async Task<IActionResult> GetAll([FromQuery] int langId = 1, CancellationToken ct = default)
        => OkResult(await Sender.Send(new GetAllCategoriesQuery(langId), ct));
}
