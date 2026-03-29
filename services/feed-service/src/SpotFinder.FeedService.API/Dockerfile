FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["shared/building-blocks/SpotFinder.BuildingBlocks/SpotFinder.BuildingBlocks.csproj", "shared/building-blocks/SpotFinder.BuildingBlocks/"]
COPY ["services/feed-service/src/SpotFinder.FeedService.Application/SpotFinder.FeedService.Application.csproj", "services/feed-service/src/SpotFinder.FeedService.Application/"]
COPY ["services/feed-service/src/SpotFinder.FeedService.Infrastructure/SpotFinder.FeedService.Infrastructure.csproj", "services/feed-service/src/SpotFinder.FeedService.Infrastructure/"]
COPY ["services/feed-service/src/SpotFinder.FeedService.API/SpotFinder.FeedService.API.csproj", "services/feed-service/src/SpotFinder.FeedService.API/"]
RUN dotnet restore "services/feed-service/src/SpotFinder.FeedService.API/SpotFinder.FeedService.API.csproj"

COPY . .
WORKDIR "/src/services/feed-service/src/SpotFinder.FeedService.API"
RUN dotnet build "SpotFinder.FeedService.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "SpotFinder.FeedService.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "SpotFinder.FeedService.API.dll"]
