using System;
using System.Collections.Generic;

namespace ChronicPainTracker.Api.Models 
{
    public class PracticeSession
    {
        public int Id { get; set; }

        // Date and time of the practice
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Foreign Key to the User who performed the practice
        public int UserId { get; set; }
        public User User { get; set; }

        // Navigation property for all emotions recorded in this session
        public List<EmotionEntry> Emotions { get; set; } = new();
    }
}