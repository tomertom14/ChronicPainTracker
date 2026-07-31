using ChronicPainTracker.Api.DTOs;
using ChronicPainTracker.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;
using ChronicPainTracker.Api.Data;


namespace ChronicPainTracker.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PracticeController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PracticeController(AppDbContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return userIdClaim == null ? 0 : int.Parse(userIdClaim.Value);
        }

        [HttpPost]
        public async Task<IActionResult> SavePracticeSession([FromBody] PracticeSessionCreateDto dto)
        {
            // 1. Get the User ID from the JWT token
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            if (userIdClaim == null)
            {
                return Unauthorized(new { message = "User ID not found in token." });
            }

            int userId = int.Parse(userIdClaim.Value);

            // 2. Map the DTO (Envelope) to the Real Database Models
            var session = new PracticeSession
            {
                UserId = userId,
                CreatedAt = DateTime.UtcNow,

                // Convert each EmotionEntryDto into a real EmotionEntry for the DB
                Emotions = dto.AllEmotions.Select(e => new EmotionEntry
                {
                    EmotionName = e.Name,
                    Intensity = e.Intensity,
                    // The ?? "" ensures that if Angular sends null, we save an empty string instead of crashing
                    WhenOccurred = e.When ?? "",
                    RegardingWhoWhat = e.WhoWhat ?? "",
                    BodyLocation = e.WhereInBody ?? "",
                    PhysicalSensation = e.PhysicalSensation ?? "",
                    Duration = e.Duration ?? ""
                }).ToList()
            };

            // 3. Save to PostgreSQL via Entity Framework
            _context.PracticeSessions.Add(session);
            await _context.SaveChangesAsync();

            // 4. Return a success message back to Angular
            return Ok(new { message = "Practice session saved successfully!", sessionId = session.Id });
        }

        // GET: api/Practice
        // Returns the current user's practice sessions, newest first
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PracticeSessionResponseDto>>> GetPracticeSessions()
        {
            int userId = GetUserId();

            var sessions = await _context.PracticeSessions
                .Where(s => s.UserId == userId)
                .OrderByDescending(s => s.CreatedAt)
                .Include(s => s.Emotions)
                .Select(s => new PracticeSessionResponseDto
                {
                    Id = s.Id,
                    CreatedAt = s.CreatedAt,
                    Emotions = s.Emotions.Select(e => new EmotionEntryResponseDto
                    {
                        Id = e.Id,
                        EmotionName = e.EmotionName,
                        Intensity = e.Intensity,
                        WhenOccurred = e.WhenOccurred,
                        RegardingWhoWhat = e.RegardingWhoWhat,
                        BodyLocation = e.BodyLocation,
                        PhysicalSensation = e.PhysicalSensation,
                        Duration = e.Duration
                    }).ToList()
                })
                .ToListAsync();

            return Ok(sessions);
        }

        // GET: api/Practice/{id}
        // Returns a single session's detail, scoped to the current user
        [HttpGet("{id:int}")]
        public async Task<ActionResult<PracticeSessionResponseDto>> GetPracticeSession(int id)
        {
            int userId = GetUserId();

            var session = await _context.PracticeSessions
                .Where(s => s.Id == id && s.UserId == userId)
                .Include(s => s.Emotions)
                .Select(s => new PracticeSessionResponseDto
                {
                    Id = s.Id,
                    CreatedAt = s.CreatedAt,
                    Emotions = s.Emotions.Select(e => new EmotionEntryResponseDto
                    {
                        Id = e.Id,
                        EmotionName = e.EmotionName,
                        Intensity = e.Intensity,
                        WhenOccurred = e.WhenOccurred,
                        RegardingWhoWhat = e.RegardingWhoWhat,
                        BodyLocation = e.BodyLocation,
                        PhysicalSensation = e.PhysicalSensation,
                        Duration = e.Duration
                    }).ToList()
                })
                .FirstOrDefaultAsync();

            if (session == null)
            {
                return NotFound();
            }

            return Ok(session);
        }

        // GET: api/Practice/insights
        // Returns aggregated stats: streaks, top emotions, and an intensity trend for charting
        [HttpGet("insights")]
        public async Task<ActionResult<PracticeInsightsDto>> GetInsights()
        {
            int userId = GetUserId();

            var sessions = await _context.PracticeSessions
                .Where(s => s.UserId == userId)
                .Include(s => s.Emotions)
                .OrderByDescending(s => s.CreatedAt)
                .ToListAsync();

            var insights = new PracticeInsightsDto
            {
                TotalSessions = sessions.Count,
                LastPracticedAt = sessions.Count > 0 ? sessions[0].CreatedAt : null
            };

            if (sessions.Count == 0)
            {
                return Ok(insights);
            }

            // Distinct practice days (UTC), used for streak math and the trend chart
            var practiceDays = sessions
                .Select(s => s.CreatedAt.Date)
                .Distinct()
                .OrderByDescending(d => d)
                .ToList();

            insights.CurrentStreak = ComputeCurrentStreak(practiceDays);
            insights.LongestStreak = ComputeLongestStreak(practiceDays);

            insights.TopEmotions = sessions
                .SelectMany(s => s.Emotions)
                .GroupBy(e => e.EmotionName)
                .Select(g => new EmotionFrequencyDto
                {
                    Name = g.Key,
                    Count = g.Count(),
                    AverageIntensity = Math.Round(g.Average(e => e.Intensity), 1)
                })
                .OrderByDescending(e => e.Count)
                .ThenByDescending(e => e.AverageIntensity)
                .Take(8)
                .ToList();

            insights.IntensityTrend = sessions
                .GroupBy(s => s.CreatedAt.Date)
                .Select(g => new IntensityTrendPointDto
                {
                    Date = g.Key,
                    AverageIntensity = Math.Round(g.SelectMany(s => s.Emotions).Average(e => (double)e.Intensity), 1),
                    SessionCount = g.Count()
                })
                .OrderBy(p => p.Date)
                .TakeLast(30)
                .ToList();

            return Ok(insights);
        }

        private static int ComputeCurrentStreak(List<DateTime> distinctDaysDesc)
        {
            if (distinctDaysDesc.Count == 0) return 0;

            var today = DateTime.UtcNow.Date;
            var mostRecent = distinctDaysDesc[0];

            // Streak is only "alive" if the user practiced today or yesterday
            if (mostRecent != today && mostRecent != today.AddDays(-1))
            {
                return 0;
            }

            int streak = 1;
            for (int i = 1; i < distinctDaysDesc.Count; i++)
            {
                var expectedPrevDay = distinctDaysDesc[i - 1].AddDays(-1);
                if (distinctDaysDesc[i] == expectedPrevDay)
                {
                    streak++;
                }
                else
                {
                    break;
                }
            }

            return streak;
        }

        private static int ComputeLongestStreak(List<DateTime> distinctDaysDesc)
        {
            if (distinctDaysDesc.Count == 0) return 0;

            var daysAsc = distinctDaysDesc.OrderBy(d => d).ToList();
            int longest = 1;
            int current = 1;

            for (int i = 1; i < daysAsc.Count; i++)
            {
                if (daysAsc[i] == daysAsc[i - 1].AddDays(1))
                {
                    current++;
                    longest = Math.Max(longest, current);
                }
                else
                {
                    current = 1;
                }
            }

            return longest;
        }
    }
}
