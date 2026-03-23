FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["shared/building-blocks/SpotFinder.BuildingBlocks/SpotFinder.BuildingBlocks.csproj", "shared/building-blocks/SpotFinder.BuildingBlocks/"]
COPY ["services/search-service/src/SpotFinder.SearchService.Domain/SpotFinder.SearchService.Domain.csproj", "services/search-service/src/SpotFinder.SearchService.Domain/"]
COPY ["services/search-service/src/SpotFinder.SearchService.Application/SpotFinder.SearchService.Application.csproj", "services/search-service/src/SpotFinder.SearchService.Application/"]
COPY ["services/search-service/src/SpotFinder.SearchService.Infrastructure/SpotFinder.SearchService.Infrastructure.csproj", "services/search-service/src/SpotFinder.SearchService.Infrastructure/"]
COPY ["services/search-service/src/SpotFinder.SearchService.API/SpotFinder.SearchService.API.csproj", "services/search-service/src/SpotFinder.SearchService.API/"]
RUN dotnet restore "services/search-service/src/SpotFinder.SearchService.API/SpotFinder.SearchService.API.csproj"

COPY . .
WORKDIR "/src/services/search-service/src/SpotFinder.SearchService.API"
RUN dotnet build "SpotFinder.SearchService.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "SpotFinder.SearchService.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "SpotFinder.SearchService.API.dll"]
