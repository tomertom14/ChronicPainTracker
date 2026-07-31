using System;
using System.Collections.Generic;

namespace ChronicPainTracker.Api.DTOs
{
    public class PracticeSessionResponseDto
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<EmotionEntryResponseDto> Emotions { get; set; } = new();
    }

    public class EmotionEntryResponseDto
    {
        public int Id { get; set; }
        public string EmotionName { get; set; } = string.Empty;
        public int Intensity { get; set; }
        public string WhenOccurred { get; set; } = string.Empty;
        public string RegardingWhoWhat { get; set; } = string.Empty;
        public string BodyLocation { get; set; } = string.Empty;
        public string PhysicalSensation { get; set; } = string.Empty;
        public string Duration { get; set; } = string.Empty;
    }

    public class PracticeInsightsDto
    {
        public int TotalSessions { get; set; }
        public int CurrentStreak { get; set; }
        public int LongestStreak { get; set; }
        public DateTime? LastPracticedAt { get; set; }
        public List<EmotionFrequencyDto> TopEmotions { get; set; } = new();
        public List<IntensityTrendPointDto> IntensityTrend { get; set; } = new();
    }

    public class EmotionFrequencyDto
    {
        public string Name { get; set; } = string.Empty;
        public int Count { get; set; }
        public double AverageIntensity { get; set; }
    }

    public class IntensityTrendPointDto
    {
        public DateTime Date { get; set; }
        public double AverageIntensity { get; set; }
        public int SessionCount { get; set; }
    }
}
