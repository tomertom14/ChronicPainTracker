using System;

namespace ChronicPainTracker.Api.Models
{
    public class EmotionEntry
    {
        public int Id { get; set; }

        // The name of the emotion (e.g., Anger, Joy)
        public string EmotionName { get; set; } = string.Empty;

        // Intensity score from 0 to 10
        public int Intensity { get; set; }

        // --- The 5 Deep-Dive Questions from the book ---
        // These can be empty strings for emotions that weren't in the Top 3
        public string WhenOccurred { get; set; } = string.Empty;
        public string RegardingWhoWhat { get; set; } = string.Empty;
        public string BodyLocation { get; set; } = string.Empty;
        public string PhysicalSensation { get; set; } = string.Empty;
        public string Duration { get; set; } = string.Empty;

        // Foreign Key to the PracticeSession
        public int PracticeSessionId { get; set; }
        public PracticeSession PracticeSession { get; set; } = null!;
    }
}