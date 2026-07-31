using System;
using System.Collections.Generic;

namespace ChronicPainTracker.Api.Models
{
    public class PainEntry
    {
        public int Id { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Foreign Key to the User who logged this entry
        public int UserId { get; set; }
        public User User { get; set; } = null!;

        // Pain intensity, 0-10
        public int Intensity { get; set; }

        // Body areas affected (e.g. "Lower back", "Left knee")
        public List<string> BodyLocations { get; set; } = new();

        // Free-text descriptor, e.g. "Sharp", "Aching", "Burning", "Throbbing"
        public string PainType { get; set; } = string.Empty;

        public string MedicationTaken { get; set; } = string.Empty;

        // Sleep quality the night before, 0-10 (optional context signal)
        public int? SleepQuality { get; set; }

        public string Notes { get; set; } = string.Empty;
    }
}
