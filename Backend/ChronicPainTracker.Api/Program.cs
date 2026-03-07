using Microsoft.AspNetCore.Builder;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using ChronicPainTracker.Api.Data;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System; // Added for Environment

namespace ChronicPainTracker.Api;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Services.AddControllers();

        // --- Database Configuration (Updated for Deployment) ---
        var connectionString = Environment.GetEnvironmentVariable("DATABASE_URL");

        if (string.IsNullOrEmpty(connectionString))
        {
            // If DATABASE_URL is not set, use local appsettings.json
            connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
        }
        else
        {
            // If it's a "postgres://" URL (like from Neon), convert it to Npgsql format
            if (connectionString.StartsWith("postgres://"))
            {
                var uri = new Uri(connectionString);
                var db = uri.AbsolutePath.Trim('/');
                var userPass = uri.UserInfo.Split(':');
                connectionString = $"Host={uri.Host};Database={db};Username={userPass[0]};Password={userPass[1]};SSL Mode=Require;Trust Server Certificate=true;";
            }
        }

        builder.Services.AddDbContext<AppDbContext>(options =>
            options.UseNpgsql(connectionString));
        // -------------------------------------------------------

        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = builder.Configuration["Jwt:Issuer"],
                    ValidAudience = builder.Configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
                };
            });

        builder.Services.AddAuthorization();

        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowApp", // Renamed for general use
                policy =>
                {
                    // Allow both local development and the future production URL
                    policy.WithOrigins("http://localhost:4200", "https://your-future-angular-app.vercel.app")
                          .AllowAnyHeader()
                          .AllowAnyMethod();
                });
        });

        var app = builder.Build();

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI();
        }

        app.UseCors("AllowApp");

        app.UseAuthentication();
        app.UseAuthorization();

        app.MapControllers();

        app.Run();
    }
}