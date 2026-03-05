using ChronicPainTracker.Api.Models;
using Microsoft.EntityFrameworkCore;
using System.Collections.Generic;

namespace ChronicPainTracker.Api.Data;

public class AppDbContext : DbContext
{
    // Constructor that accepts database configuration options and passes them to the base DbContext class
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    // This property represents the 'Emotions' table in the PostgreSQL database.
    // Entity Framework will use this to query and save instances of the Emotion model.
    public DbSet<Emotion> Emotions { get; set; }

    public DbSet<User> Users { get; set; }

    public DbSet<PracticeSession> PracticeSessions { get; set; }
    public DbSet<EmotionEntry> EmotionEntries { get; set; }
}