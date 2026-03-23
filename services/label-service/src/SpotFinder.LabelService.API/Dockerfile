FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["shared/building-blocks/SpotFinder.BuildingBlocks/SpotFinder.BuildingBlocks.csproj", "shared/building-blocks/SpotFinder.BuildingBlocks/"]
COPY ["services/label-service/src/SpotFinder.LabelService.Domain/SpotFinder.LabelService.Domain.csproj", "services/label-service/src/SpotFinder.LabelService.Domain/"]
COPY ["services/label-service/src/SpotFinder.LabelService.Application/SpotFinder.LabelService.Application.csproj", "services/label-service/src/SpotFinder.LabelService.Application/"]
COPY ["services/label-service/src/SpotFinder.LabelService.Infrastructure/SpotFinder.LabelService.Infrastructure.csproj", "services/label-service/src/SpotFinder.LabelService.Infrastructure/"]
COPY ["services/label-service/src/SpotFinder.LabelService.API/SpotFinder.LabelService.API.csproj", "services/label-service/src/SpotFinder.LabelService.API/"]
RUN dotnet restore "services/label-service/src/SpotFinder.LabelService.API/SpotFinder.LabelService.API.csproj"

COPY . .
WORKDIR "/src/services/label-service/src/SpotFinder.LabelService.API"
RUN dotnet build "SpotFinder.LabelService.API.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "SpotFinder.LabelService.API.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "SpotFinder.LabelService.API.dll"]
