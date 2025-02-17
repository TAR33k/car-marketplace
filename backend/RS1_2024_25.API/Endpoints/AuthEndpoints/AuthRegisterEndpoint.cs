using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Data.Models;
using RS1_2024_25.API.Data.Models.Auth;
using RS1_2024_25.API.Helper;
using RS1_2024_25.API.Helper.Api;
using RS1_2024_25.API.Services;
using System.Threading;
using System.Threading.Tasks;
using static RS1_2024_25.API.Endpoints.Auth.AuthRegisterEndpoint;

namespace RS1_2024_25.API.Endpoints.Auth
{
    [Route("auth")]
    public class AuthRegisterEndpoint(ApplicationDbContext db, MyAuthService authService) : MyEndpointBaseAsync
        .WithRequest<RegisterRequest>
        .WithActionResult<RegisterResponse>
    {
        [HttpPost("register")]
        public override async Task<ActionResult<RegisterResponse>> HandleAsync(RegisterRequest request, CancellationToken cancellationToken = default)
        {
            // Check if the username already exists
            if (await db.Users.AnyAsync(u => u.Username == request.Username, cancellationToken))
            {
                return Conflict("Username is already taken.");
            }

            // Validate password strength
            if (!PasswordStrengthChecker.IsStrongPassword(request.Password))
            {
                return BadRequest("Password must meet strength requirements (minimum length, uppercase, lowercase, number, special character).");
            }

            // Create a new user
            var newUser = new User
            {
                FirstName = request.Name,
                LastName = request.Surname,
                PhoneNumber = request.PhoneNumber,
                Address = request.Address,
                Username = request.Username,
                Email = request.EmailAddress,
                PasswordHash = PasswordHelper.HashPassword(request.Password), // Hash the password
            };

            db.Users.Add(newUser);
            await db.EnsureUserSettingsExistAsync(newUser.ID);

            await db.SaveChangesAsync(cancellationToken);

            // Generate an auth token for the new user
            var newAuthToken = await authService.GenerateAuthToken(newUser, cancellationToken);
            var authInfo = authService.GetAuthInfo(newAuthToken);

            return new RegisterResponse
            {
                Token = newAuthToken.Value,
                MyAuthInfo = authInfo
            };
        }

        [HttpGet("check-username")]
        public async Task<ActionResult> CheckUsernameAvailability([FromQuery] string username, CancellationToken cancellationToken = default)
        {
            // Check if the username already exists in the database
            if (await db.Users.AnyAsync(u => u.Username == username, cancellationToken))
            {
                return Ok(new { isAvailable = false }); // Username is taken
            }
            return Ok(new { isAvailable = true }); // Username is available
        }


        public class RegisterRequest
        {
            public required string Name { get; set; }
            public required string Surname { get; set; }
            public required string PhoneNumber { get; set; }
            public required string Address { get; set; }
            public required string EmailAddress { get; set; }
            public required string Username { get; set; }
            public required string Password { get; set; }
        }

        public class RegisterResponse
        {
            public required MyAuthInfo? MyAuthInfo { get; set; }
            public required string Token { get; set; }
        }
    }
}
