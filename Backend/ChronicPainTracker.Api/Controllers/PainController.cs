using ChronicPainTracker.Api.Data;
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

namespace ChronicPainTracker.Api.Controllers
{
    [Authorize]
    [ApiController]
    [Route("api/[controller]")]
    public class PainController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PainController(AppDbContext context)
        {
            _context = context;
        }

        private int GetUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier);
            return userIdClaim == null ? 0 : int.Parse(userIdClaim.Value);
        }

        // POST: api/Pain
        [HttpPost]
        public async Task<IActionResult> CreatePainEntry([FromBody] PainEntryCreateDto dto)
        {
            int userId = GetUserId();
            if (userId == 0)
            {
                return Unauthorized(new { message = "User ID not found in token." });
            }

            if (dto.Intensity < 0 || dto.Intensity > 10)
            {
                return BadRequest(new { message = "Intensity must be between 0 and 10." });
            }

            var entry = new PainEntry
            {
                UserId = userId,
                CreatedAt = DateTime.UtcNow,
                Intensity = dto.Intensity,
                BodyLocations = dto.BodyLocations ?? new List<string>(),
                PainType = dto.PainType ?? "",
                MedicationTaken = dto.MedicationTaken ?? "",
                SleepQuality = dto.SleepQuality,
                Notes = dto.Notes ?? ""
            };

            _context.PainEntries.Add(entry);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Pain entry saved successfully!", entryId = entry.Id });
        }

        // GET: api/Pain
        [HttpGet]
        public async Task<ActionResult<IEnumerable<PainEntryResponseDto>>> GetPainEntries()
        {
            int userId = GetUserId();

            var entries = await _context.PainEntries
                .Where(p => p.UserId == userId)
                .OrderByDescending(p => p.CreatedAt)
                .Select(p => new PainEntryResponseDto
                {
                    Id = p.Id,
                    CreatedAt = p.CreatedAt,
                    Intensity = p.Intensity,
                    BodyLocations = p.BodyLocations,
                    PainType = p.PainType,
                    MedicationTaken = p.MedicationTaken,
                    SleepQuality = p.SleepQuality,
                    Notes = p.Notes
                })
                .ToListAsync();

            return Ok(entries);
        }

        // GET: api/Pain/{id}
        [HttpGet("{id:int}")]
        public async Task<ActionResult<PainEntryResponseDto>> GetPainEntry(int id)
        {
            int userId = GetUserId();

            var entry = await _context.PainEntries
                .Where(p => p.Id == id && p.UserId == userId)
                .Select(p => new PainEntryResponseDto
                {
                    Id = p.Id,
                    CreatedAt = p.CreatedAt,
                    Intensity = p.Intensity,
                    BodyLocations = p.BodyLocations,
                    PainType = p.PainType,
                    MedicationTaken = p.MedicationTaken,
                    SleepQuality = p.SleepQuality,
                    Notes = p.Notes
                })
                .FirstOrDefaultAsync();

            if (entry == null)
            {
                return NotFound();
            }

            return Ok(entry);
        }

        // GET: api/Pain/insights
        // Trend + top locations, in the same shape family as PracticeController's insights
        [HttpGet("insights")]
        public async Task<ActionResult<PainInsightsDto>> GetInsights()
        {
            int userId = GetUserId();

            var entries = await _context.PainEntries
                .Where(p => p.UserId == userId)
                .ToListAsync();

            var insights = new PainInsightsDto
            {
                TotalEntries = entries.Count
            };

            if (entries.Count == 0)
            {
                return Ok(insights);
            }

            insights.TopLocations = entries
                .SelectMany(p => p.BodyLocations)
                .GroupBy(loc => loc)
                .Select(g => new BodyLocationFrequencyDto { Name = g.Key, Count = g.Count() })
                .OrderByDescending(l => l.Count)
                .Take(8)
                .ToList();

            insights.IntensityTrend = entries
                .GroupBy(p => p.CreatedAt.Date)
                .Select(g => new IntensityTrendPointDto
                {
                    Date = g.Key,
                    AverageIntensity = Math.Round(g.Average(p => (double)p.Intensity), 1),
                    SessionCount = g.Count()
                })
                .OrderBy(p => p.Date)
                .TakeLast(30)
                .ToList();

            return Ok(insights);
        }
    }
}
