FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["shared/building-blocks/SpotFinder.BuildingBlocks/SpotFinder.BuildingBlocks.csproj", "shared/building-blocks/SpotFinder.BuildingBlocks/"]
COPY ["shared/shared-kernel/SpotFinder.SharedKernel/SpotFinder.SharedKernel.csproj", "shared/shared-kernel/SpotFinder.SharedKernel/"]
COPY ["services/geo-service/src/SpotFinder.GeoService.Domain/SpotFinder.GeoService.Domain.csproj", "services/geo-service/src/SpotFinder.GeoService.Domain/"]
COPY ["services/geo-service/src/SpotFinder.GeoService.Application/SpotFinder.GeoService.Application.csproj", "services/geo-service/src/SpotFinder.GeoService.Application/"]
COPY ["services/geo-service/src/SpotFinder.GeoService.Infrastructure/SpotFinder.GeoService.Infrastructure.csproj", "services/geo-service/src/SpotFinder.GeoService.Infrastructure/"]
COPY ["services/geo-service/src/SpotFinder.GeoService.API/SpotFinder.GeoService.API.csproj", "services/geo-service/src/SpotFinder.GeoService.API/"]
RUN dotnet restore "services/geo-service/src/SpotFinder.GeoService.API/SpotFinder.GeoService.API.csproj"

COPY . .
WORKDIR "/src/services/geo-service/src/SpotFinder.GeoService.API"
RUN dotnet build "SpotFinder.GeoService.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "SpotFinder.GeoService.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "SpotFinder.GeoService.API.dll"]
