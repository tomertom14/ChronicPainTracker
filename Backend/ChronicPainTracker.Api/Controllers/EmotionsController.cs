using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using ChronicPainTracker.Api.Data;
using ChronicPainTracker.Api.Models;

namespace ChronicPainTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class EmotionsController : ControllerBase
{
    private readonly AppDbContext _context;

    // Injecting the DbContext into the controller via the constructor
    public EmotionsController(AppDbContext context)
    {
        _context = context;
    }

    // GET: api/Emotions
    // Retrieves the list of all emotions from the database
    [HttpGet]
    public async Task<ActionResult<IEnumerable<Emotion>>> GetEmotions()
    {
        var emotions = await _context.Emotions.ToListAsync();
        return Ok(emotions);
    }

    // POST: api/Emotions
    // Adds a new emotion to the database
    [HttpPost]
    public async Task<ActionResult<Emotion>> AddEmotion([FromBody] string name)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            return BadRequest("Emotion name cannot be empty.");
        }

        var emotion = new Emotion { Name = name.Trim() };

        _context.Emotions.Add(emotion);
        await _context.SaveChangesAsync();

        // Returns a 201 Created response with the newly created emotion
        return CreatedAtAction(nameof(GetEmotions), new { id = emotion.Id }, emotion);
    }
}