using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using SpotFinder.BuildingBlocks.Api;
using SpotFinder.ContentService.Application;
using SpotFinder.ContentService.Infrastructure;
using SpotFinder.ContentService.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "SpotFinder Content Service", Version = "v1" });
    c.AddSecurityDefinition("Bearer", new()
    {
        Name = "Authorization", Type = Microsoft.OpenApi.Models.SecuritySchemeType.Http,
        Scheme = "bearer", BearerFormat = "JWT", In = Microsoft.OpenApi.Models.ParameterLocation.Header
    });
    c.AddSecurityRequirement(new()
    {
        { new() { Reference = new() { Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme, Id = "Bearer" } }, [] }
    });
});

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true, ValidateAudience = true, ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = builder.Configuration["Jwt:Issuer"],
            ValidAudience = builder.Configuration["Jwt:Audience"],
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(builder.Configuration["Jwt:SecretKey"]!))
        };
    });

builder.Services.AddAuthorization();

var app = builder.Build();

app.UseGlobalExceptionHandler();

using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<ContentDbContext>();
    db.Database.EnsureCreated();
    await db.Database.ExecuteSqlRawAsync(@"
        CREATE TABLE IF NOT EXISTS content.user_interests (
            user_id    UUID          NOT NULL,
            label_id   INTEGER       NOT NULL,
            score      NUMERIC(8,2)  NOT NULL DEFAULT 0,
            updated_at TIMESTAMP     NOT NULL DEFAULT NOW(),
            PRIMARY KEY (user_id, label_id)
        );
        CREATE INDEX IF NOT EXISTS idx_user_interests_user  ON content.user_interests (user_id);
        CREATE INDEX IF NOT EXISTS idx_user_interests_label ON content.user_interests (label_id);
        CREATE TABLE IF NOT EXISTS content.trending_scores (
            place_id   UUID          NOT NULL,
            score      NUMERIC(10,2) NOT NULL DEFAULT 0,
            updated_at TIMESTAMP     NOT NULL DEFAULT NOW(),
            PRIMARY KEY (place_id)
        );
        CREATE INDEX IF NOT EXISTS idx_trending_scores_score ON content.trending_scores (score DESC);
    ");
}

if (app.Environment.IsDevelopment()) { app.UseSwagger(); app.UseSwaggerUI(); }
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
