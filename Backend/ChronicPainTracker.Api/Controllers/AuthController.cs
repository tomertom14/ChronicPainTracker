using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using ChronicPainTracker.Api.Data;
using ChronicPainTracker.Api.Models;
using ChronicPainTracker.Api.Services; 
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using System;
using Google.Apis.Auth;

namespace ChronicPainTracker.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _context;
    private readonly IConfiguration _configuration;
    private readonly IEmailService _emailService; // Added Email Service

    public AuthController(AppDbContext context, IConfiguration configuration, IEmailService emailService)
    {
        _context = context;
        _configuration = configuration;
        _emailService = emailService;
    }

    [HttpPost("register")]
    public async Task<IActionResult> Register([FromBody] UserDto request)
    {
        // 1. Check if Username or Email already exists
        if (await _context.Users.AnyAsync(u => u.Username == request.Username))
            return BadRequest("Username already exists.");

        if (await _context.Users.AnyAsync(u => u.Email == request.Email))
            return BadRequest("Email already exists.");

        // 2. Generate a unique confirmation token
        var confirmationToken = Guid.NewGuid().ToString();

        // 3. Create the user object
        var user = new User
        {
            Username = request.Username,
            Email = request.Email, // Make sure you added this to UserDto!
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            IsEmailConfirmed = false, // Require confirmation
            EmailConfirmationToken = confirmationToken
        };

        _context.Users.Add(user);
        await _context.SaveChangesAsync();

        // 4. Send the confirmation email
        // We will point the link to your local Angular app for now
        var frontendUrl = _configuration["FrontendUrl"] ?? "http://localhost:4200";
        var confirmationLink = $"{frontendUrl}/verify-email?token={confirmationToken}&email={request.Email}";

        var emailBody = $@"
            <h2>Welcome to Chronic Pain Tracker!</h2>
            <p>Hi {request.Username},</p>
            <p>Thank you for registering. Please confirm your email address by clicking the link below:</p>
            <a href='{confirmationLink}' style='display:inline-block;padding:10px 20px;background-color:#10b981;color:white;text-decoration:none;border-radius:5px;'>Confirm My Email</a>
            <p>If you didn't request this, you can safely ignore this email.</p>";

        try
        {
            await _emailService.SendEmailAsync(user.Email, "Confirm your email - Chronic Pain Tracker", emailBody);
        }
        catch (Exception ex)
        {
            // If email fails, the user is still saved, but we return a 500 error for debugging
            return StatusCode(500, $"User registered, but failed to send confirmation email. Error: {ex.Message}");
        }

        return Ok(new { message = "Registration successful. Please check your email to confirm your account." });
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login([FromBody] UserDto request)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == request.Email);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            return Unauthorized("Invalid email or password.");

        // --- NEW: Block login if email is not confirmed ---
        if (!user.IsEmailConfirmed)
            return Unauthorized("Please confirm your email before logging in.");

        var token = CreateToken(user);
        return Ok(new { token });
    }


    [HttpGet("confirm-email")]
    public async Task<IActionResult> ConfirmEmail([FromQuery] string email, [FromQuery] string token)
    {
        var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email && u.EmailConfirmationToken == token);

        if (user == null)
            return BadRequest("Invalid email or token.");

        // Mark as confirmed and remove the token so it can't be used again
        user.IsEmailConfirmed = true;
        user.EmailConfirmationToken = null;

        await _context.SaveChangesAsync();

        return Ok(new { message = "Email confirmed successfully. You can now log in." });
    }

    private string CreateToken(User user)
    {
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString())
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            expires: DateTime.Now.AddDays(1),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    
   [HttpPost("google")]
    public async Task<IActionResult> GoogleLogin([FromBody] GoogleAuthRequest request)
    {
        try
        {
            var settings = new GoogleJsonWebSignature.ValidationSettings()
            {
                // Updated _config to _configuration to match your controller
                Audience = new List<string>() { _configuration["GoogleAuth:ClientId"]! }
            };

            var payload = await GoogleJsonWebSignature.ValidateAsync(request.Token, settings);

            // Updated _dbContext to _context to match your controller
            var user = _context.Users.FirstOrDefault(u => u.Email == payload.Email);

            if (user == null)
            {
                user = new User
                {
                    Email = payload.Email,
                    Username = payload.Name ?? payload.Email.Split('@')[0],
                    PasswordHash = "", // Provide an empty string or dummy hash if your DB requires this field
                    IsEmailConfirmed = true // Updated to match your User model
                };
                
                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }

            var jwtToken = CreateToken(user); 

            return Ok(new { token = jwtToken }); 
        }
        catch (InvalidJwtException)
        {
            return BadRequest(new { message = "Invalid Google token." });
        }
        catch (Exception)
        {
            return StatusCode(500, new { message = "An error occurred during Google authentication." });
        }
    }
}
// Simple DTO for receiving data
public class UserDto { 
    public string Username { get; set; } = string.Empty;
    public string Password { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;

}