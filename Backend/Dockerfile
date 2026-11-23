# Build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

COPY Backend/GalyCrudBackend.csproj Backend/
RUN dotnet restore Backend/GalyCrudBackend.csproj

COPY Backend/ Backend/
RUN dotnet publish Backend/GalyCrudBackend.csproj -c Release -o /app/publish --no-restore

# Runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS final
WORKDIR /app

RUN mkdir -p /app/Data
COPY --from=build /app/publish .

ENV ASPNETCORE_ENVIRONMENT=Production \
    ASPNETCORE_URLS=http://+:5000 \
    ConnectionStrings__DefaultConnection="Data Source=/app/Data/colegio.db"

EXPOSE 5000
VOLUME ["/app/Data"]

ENTRYPOINT ["dotnet", "GalyCrudBackend.dll"]
