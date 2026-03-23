FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["shared/building-blocks/SpotFinder.BuildingBlocks/SpotFinder.BuildingBlocks.csproj", "shared/building-blocks/SpotFinder.BuildingBlocks/"]
COPY ["shared/contracts/SpotFinder.Contracts/SpotFinder.Contracts.csproj", "shared/contracts/SpotFinder.Contracts/"]
COPY ["services/identity-service/src/SpotFinder.IdentityService.Domain/SpotFinder.IdentityService.Domain.csproj", "services/identity-service/src/SpotFinder.IdentityService.Domain/"]
COPY ["services/identity-service/src/SpotFinder.IdentityService.Application/SpotFinder.IdentityService.Application.csproj", "services/identity-service/src/SpotFinder.IdentityService.Application/"]
COPY ["services/identity-service/src/SpotFinder.IdentityService.Infrastructure/SpotFinder.IdentityService.Infrastructure.csproj", "services/identity-service/src/SpotFinder.IdentityService.Infrastructure/"]
COPY ["services/identity-service/src/SpotFinder.IdentityService.API/SpotFinder.IdentityService.API.csproj", "services/identity-service/src/SpotFinder.IdentityService.API/"]
RUN dotnet restore "services/identity-service/src/SpotFinder.IdentityService.API/SpotFinder.IdentityService.API.csproj"

COPY . .
WORKDIR "/src/services/identity-service/src/SpotFinder.IdentityService.API"
RUN dotnet build "SpotFinder.IdentityService.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "SpotFinder.IdentityService.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "SpotFinder.IdentityService.API.dll"]
