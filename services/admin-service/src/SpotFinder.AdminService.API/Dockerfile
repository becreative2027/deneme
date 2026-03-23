FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["shared/building-blocks/SpotFinder.BuildingBlocks/SpotFinder.BuildingBlocks.csproj", "shared/building-blocks/SpotFinder.BuildingBlocks/"]
COPY ["services/admin-service/src/SpotFinder.AdminService.Domain/SpotFinder.AdminService.Domain.csproj", "services/admin-service/src/SpotFinder.AdminService.Domain/"]
COPY ["services/admin-service/src/SpotFinder.AdminService.Application/SpotFinder.AdminService.Application.csproj", "services/admin-service/src/SpotFinder.AdminService.Application/"]
COPY ["services/admin-service/src/SpotFinder.AdminService.Infrastructure/SpotFinder.AdminService.Infrastructure.csproj", "services/admin-service/src/SpotFinder.AdminService.Infrastructure/"]
COPY ["services/admin-service/src/SpotFinder.AdminService.API/SpotFinder.AdminService.API.csproj", "services/admin-service/src/SpotFinder.AdminService.API/"]
RUN dotnet restore "services/admin-service/src/SpotFinder.AdminService.API/SpotFinder.AdminService.API.csproj"

COPY . .
WORKDIR "/src/services/admin-service/src/SpotFinder.AdminService.API"
RUN dotnet build "SpotFinder.AdminService.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "SpotFinder.AdminService.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "SpotFinder.AdminService.API.dll"]
