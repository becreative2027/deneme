FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS base
WORKDIR /app
EXPOSE 8080

FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ["gateway/api-gateway/SpotFinder.ApiGateway/SpotFinder.ApiGateway.csproj", "gateway/api-gateway/SpotFinder.ApiGateway/"]
RUN dotnet restore "gateway/api-gateway/SpotFinder.ApiGateway/SpotFinder.ApiGateway.csproj"

COPY . .
WORKDIR "/src/gateway/api-gateway/SpotFinder.ApiGateway"
RUN dotnet build "SpotFinder.ApiGateway.csproj" -c Release -o /app/build

FROM build AS publish
RUN dotnet publish "SpotFinder.ApiGateway.csproj" -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "SpotFinder.ApiGateway.dll"]
