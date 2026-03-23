FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["shared/building-blocks/SpotFinder.BuildingBlocks/SpotFinder.BuildingBlocks.csproj", "shared/building-blocks/SpotFinder.BuildingBlocks/"]
COPY ["services/content-service/src/SpotFinder.ContentService.Domain/SpotFinder.ContentService.Domain.csproj", "services/content-service/src/SpotFinder.ContentService.Domain/"]
COPY ["services/content-service/src/SpotFinder.ContentService.Application/SpotFinder.ContentService.Application.csproj", "services/content-service/src/SpotFinder.ContentService.Application/"]
COPY ["services/content-service/src/SpotFinder.ContentService.Infrastructure/SpotFinder.ContentService.Infrastructure.csproj", "services/content-service/src/SpotFinder.ContentService.Infrastructure/"]
COPY ["services/content-service/src/SpotFinder.ContentService.API/SpotFinder.ContentService.API.csproj", "services/content-service/src/SpotFinder.ContentService.API/"]
RUN dotnet restore "services/content-service/src/SpotFinder.ContentService.API/SpotFinder.ContentService.API.csproj"

COPY . .
WORKDIR "/src/services/content-service/src/SpotFinder.ContentService.API"
RUN dotnet build "SpotFinder.ContentService.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "SpotFinder.ContentService.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "SpotFinder.ContentService.API.dll"]
