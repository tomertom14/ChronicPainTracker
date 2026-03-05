using System.Collections.Generic;

namespace ChronicPainTracker.Api.DTOs
{
    // The main envelope coming from Angular
    public class PracticeSessionCreateDto
    {
        // A list of all emotions the user rated above 0
        public List<EmotionEntryDto> AllEmotions { get; set; } = new();
    }

    // The shape of each individual emotion inside that list
    public class EmotionEntryDto
    {
        public string Name { get; set; } = string.Empty;
        public int Intensity { get; set; }

        // The 5 questions - making them nullable (?) because they might be empty 
        // if the emotion wasn't in the user's top 3
        public string? When { get; set; }
        public string? WhoWhat { get; set; }
        public string? WhereInBody { get; set; }
        public string? PhysicalSensation { get; set; }
        public string? Duration { get; set; }
    }
}