using MediatR;
using Microsoft.AspNetCore.Mvc;
namespace SpotFinder.BuildingBlocks.Api;

[ApiController]
[Route("api/[controller]")]
public abstract class BaseController : ControllerBase
{
    protected readonly ISender Sender;
    protected BaseController(ISender sender) { Sender = sender; }
    protected IActionResult OkResult<T>(T data) => Ok(ApiResponse<T>.Ok(data));
    protected IActionResult CreatedResult<T>(string routeName, object routeValues, T data)
        => CreatedAtRoute(routeName, routeValues, ApiResponse<T>.Ok(data));
    protected IActionResult FailResult(string error, int statusCode = 400)
        => StatusCode(statusCode, ApiResponse.Fail(error));
}
