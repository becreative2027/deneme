FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["shared/building-blocks/SpotFinder.BuildingBlocks/SpotFinder.BuildingBlocks.csproj", "shared/building-blocks/SpotFinder.BuildingBlocks/"]
COPY ["shared/shared-kernel/SpotFinder.SharedKernel/SpotFinder.SharedKernel.csproj", "shared/shared-kernel/SpotFinder.SharedKernel/"]
COPY ["services/place-service/src/SpotFinder.PlaceService.Domain/SpotFinder.PlaceService.Domain.csproj", "services/place-service/src/SpotFinder.PlaceService.Domain/"]
COPY ["services/place-service/src/SpotFinder.PlaceService.Application/SpotFinder.PlaceService.Application.csproj", "services/place-service/src/SpotFinder.PlaceService.Application/"]
COPY ["services/place-service/src/SpotFinder.PlaceService.Infrastructure/SpotFinder.PlaceService.Infrastructure.csproj", "services/place-service/src/SpotFinder.PlaceService.Infrastructure/"]
COPY ["services/place-service/src/SpotFinder.PlaceService.API/SpotFinder.PlaceService.API.csproj", "services/place-service/src/SpotFinder.PlaceService.API/"]
RUN dotnet restore "services/place-service/src/SpotFinder.PlaceService.API/SpotFinder.PlaceService.API.csproj"

COPY . .
WORKDIR "/src/services/place-service/src/SpotFinder.PlaceService.API"
RUN dotnet build "SpotFinder.PlaceService.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "SpotFinder.PlaceService.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "SpotFinder.PlaceService.API.dll"]
