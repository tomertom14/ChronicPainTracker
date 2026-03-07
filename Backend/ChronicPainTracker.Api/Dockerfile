# Build Stage
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy project file and restore dependencies
COPY ["ChronicPainTracker.Api.csproj", "./"]
RUN dotnet restore "ChronicPainTracker.Api.csproj"

# Copy all files and build the project
COPY . .
RUN dotnet publish "ChronicPainTracker.Api.csproj" -c Release -o /app/publish

# Runtime Stage
FROM mcr.microsoft.com/dotnet/aspnet:9.0
WORKDIR /app
COPY --from=build /app/publish .

# Set the port Render expects
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "ChronicPainTracker.Api.dll"]