using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace ChronicPainTracker.Api;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        // Add services to the container to support API controllers
        builder.Services.AddControllers();

        // Configure Swagger/OpenAPI for API documentation and testing
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        var app = builder.Build();

        // Configure the HTTP request pipeline
        if (app.Environment.IsDevelopment())
        {
            // Enable Swagger UI only in development environment
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        // Redirect all HTTP requests to HTTPS for security
        app.UseHttpsRedirection();

        // Enable authorization middleware
        app.UseAuthorization();

        // Map the controller routes to the request pipeline
        app.MapControllers();

        app.Run();
    }
}