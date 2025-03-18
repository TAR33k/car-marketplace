using Azure.Core;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Helper.Api;
using RS1_2024_25.API.Services;
using System.Threading;
using System.Threading.Tasks;
using static RS1_2024_25.API.Endpoints.AuthEndpoints.AuthLogoutEndpoint;

namespace RS1_2024_25.API.Endpoints.AuthEndpoints;

[Route("auth")]
public class AuthLogoutEndpoint(ApplicationDbContext db, MyAuthService authService) : MyEndpointBaseAsync
        .WithoutRequest
        .WithResult<LogoutResponse>
{
    [HttpPost("logout")]
    public override async Task<LogoutResponse> HandleAsync(CancellationToken cancellationToken = default)
    {
        // Extract the token from the request header
        string? authToken = Request.Headers["my-auth-token"];

        // If the token is missing, return an error response
        if (string.IsNullOrEmpty(authToken))
        {
            return new LogoutResponse
            {
                IsSuccess = false,
                Message = "Token is missing in the request header."
            };
        }

        // Get user information from the token
        var authInfo = authService.GetAuthInfoFromJwtToken(authToken);

        // If the user is logged in, proceed with logout logic
        if (authInfo.IsLoggedIn)
        {
            // Retrieve the user from the database
            var user = await db.Users.FindAsync(authInfo.UserId);

            if (user != null)
            {
                // Update the user's online status and last seen time
                user.IsOnline = false;
                user.LastSeen = DateTime.UtcNow;

                // Save changes to the database
                await db.SaveChangesAsync(cancellationToken);
            }
        }

        // Return a successful logout response
        return new LogoutResponse
        {
            IsSuccess = true,
            Message = "Logout successful."
        };
    }

    public class LogoutResponse
    {
        public bool IsSuccess { get; set; }
        public string Message { get; set; }
    }
}
