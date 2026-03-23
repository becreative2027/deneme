FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["shared/building-blocks/SpotFinder.BuildingBlocks/SpotFinder.BuildingBlocks.csproj", "shared/building-blocks/SpotFinder.BuildingBlocks/"]
COPY ["services/social-graph-service/src/SpotFinder.SocialGraphService.Domain/SpotFinder.SocialGraphService.Domain.csproj", "services/social-graph-service/src/SpotFinder.SocialGraphService.Domain/"]
COPY ["services/social-graph-service/src/SpotFinder.SocialGraphService.Application/SpotFinder.SocialGraphService.Application.csproj", "services/social-graph-service/src/SpotFinder.SocialGraphService.Application/"]
COPY ["services/social-graph-service/src/SpotFinder.SocialGraphService.Infrastructure/SpotFinder.SocialGraphService.Infrastructure.csproj", "services/social-graph-service/src/SpotFinder.SocialGraphService.Infrastructure/"]
COPY ["services/social-graph-service/src/SpotFinder.SocialGraphService.API/SpotFinder.SocialGraphService.API.csproj", "services/social-graph-service/src/SpotFinder.SocialGraphService.API/"]
RUN dotnet restore "services/social-graph-service/src/SpotFinder.SocialGraphService.API/SpotFinder.SocialGraphService.API.csproj"

COPY . .
WORKDIR "/src/services/social-graph-service/src/SpotFinder.SocialGraphService.API"
RUN dotnet build "SpotFinder.SocialGraphService.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "SpotFinder.SocialGraphService.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "SpotFinder.SocialGraphService.API.dll"]
