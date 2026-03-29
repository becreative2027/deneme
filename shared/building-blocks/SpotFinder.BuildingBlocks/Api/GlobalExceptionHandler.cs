using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;

namespace SpotFinder.BuildingBlocks.Api;

public static class GlobalExceptionHandlerExtensions
{
    public static IApplicationBuilder UseGlobalExceptionHandler(this IApplicationBuilder app)
    {
        app.Use(async (context, next) =>
        {
            try
            {
                await next(context);
            }
            catch (Exception ex)
            {
                context.Response.ContentType = "application/json";
                context.Response.StatusCode = ex switch
                {
                    UnauthorizedAccessException => (int)HttpStatusCode.Unauthorized,
                    InvalidOperationException   => (int)HttpStatusCode.BadRequest,
                    ArgumentException           => (int)HttpStatusCode.BadRequest,
                    KeyNotFoundException         => (int)HttpStatusCode.NotFound,
                    _                           => (int)HttpStatusCode.InternalServerError,
                };

                var body = JsonSerializer.Serialize(new
                {
                    success = false,
                    error   = ex.Message,
                    type    = ex.GetType().Name
                });
                await context.Response.WriteAsync(body);
            }
        });
        return app;
    }
}
