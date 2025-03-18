using Microsoft.AspNetCore.Mvc;
using RS1_2024_25.API.Data.Models.Auth;
using RS1_2024_25.API.Services;

namespace RS1_2024_25.API.Endpoints.AuthEndpoints
{
    [Route("auth")]
    [ApiController]
    public class SendInviteEmailEndpoint : ControllerBase
    {
        private readonly MyAuthService _authService;

        public SendInviteEmailEndpoint(MyAuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("send-invite")]
        public async Task<IActionResult> SendInvite([FromBody] SendInviteRequest request)
        {
            if (string.IsNullOrWhiteSpace(request.Email))
                return BadRequest("Email is required.");

            // Dohvati token iz Authorization headera
            var token = Request.Headers["my-auth-token"].ToString();

            if (string.IsNullOrEmpty(token))
                return Unauthorized("Missing or invalid token.");

            // Parsiraj korisničke podatke iz tokena
            var user = _authService.GetAuthInfoFromJwtToken(token);
            if (user == null)
                return Unauthorized("Invalid token.");

            Console.WriteLine("Authorization Header: " + Request.Headers["my-auth-token"]);

            // Pošalji email pozivnicu koristeći korisnika iz tokena
            bool isEmailSent = await _authService.SendInviteEmail(request.Email, token);

            if (isEmailSent)
            {
                return Ok(new { message = "Invitation sent successfully." });
            }
            else
            {
                return StatusCode(500, "Error sending invitation.");
            }
        }
    }

    // Define the request model to pass email and user info
    public class SendInviteRequest
    {
        public required string Email { get; set; }
    }
}
