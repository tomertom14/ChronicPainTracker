using System;
using System.Collections.Generic;

namespace ChronicPainTracker.Api.DTOs
{
    public class PainEntryCreateDto
    {
        public int Intensity { get; set; }
        public List<string> BodyLocations { get; set; } = new();
        public string? PainType { get; set; }
        public string? MedicationTaken { get; set; }
        public int? SleepQuality { get; set; }
        public string? Notes { get; set; }
    }

    public class PainEntryResponseDto
    {
        public int Id { get; set; }
        public DateTime CreatedAt { get; set; }
        public int Intensity { get; set; }
        public List<string> BodyLocations { get; set; } = new();
        public string PainType { get; set; } = string.Empty;
        public string MedicationTaken { get; set; } = string.Empty;
        public int? SleepQuality { get; set; }
        public string Notes { get; set; } = string.Empty;
    }

    public class PainInsightsDto
    {
        public int TotalEntries { get; set; }
        public List<BodyLocationFrequencyDto> TopLocations { get; set; } = new();
        public List<IntensityTrendPointDto> IntensityTrend { get; set; } = new();
    }

    public class BodyLocationFrequencyDto
    {
        public string Name { get; set; } = string.Empty;
        public int Count { get; set; }
    }
}
