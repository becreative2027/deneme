using System.Net;
using System.Text.Json;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace SpotFinder.BuildingBlocks.Api;

public static class GlobalExceptionHandlerExtensions
{
    public static IApplicationBuilder UseGlobalExceptionHandler(this IApplicationBuilder app)
    {
        app.UseExceptionHandler(errApp =>
        {
            errApp.Run(async context =>
            {
                var feature = context.Features.Get<IExceptionHandlerFeature>();
                var ex = feature?.Error;
                if (ex is null) return;

                var logger = context.RequestServices
                    .GetService(typeof(ILogger<IExceptionHandlerFeature>)) as ILogger;
                logger?.LogError(ex, "Unhandled exception: {Message}", ex.Message);

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
            });
        });
        return app;
    }
}
