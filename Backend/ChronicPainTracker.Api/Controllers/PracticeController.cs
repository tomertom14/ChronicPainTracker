using ChronicPainTracker.Api.DTOs;
using ChronicPainTracker.Api.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using System;
using System.Linq;
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
    }
}