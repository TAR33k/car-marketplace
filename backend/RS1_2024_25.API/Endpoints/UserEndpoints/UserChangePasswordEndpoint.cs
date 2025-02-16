using Microsoft.AspNetCore.Mvc;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Helper;
using RS1_2024_25.API.Helper.Api;
using RS1_2024_25.API.Services;
using static RS1_2024_25.API.Endpoints.UserEndpoints.UserChangePasswordEndpoint;

namespace RS1_2024_25.API.Endpoints.UserEndpoints
{
    [Route("users")]
    public class UserChangePasswordEndpoint(
        ApplicationDbContext db,
        MyAuthService myAuthService) : MyEndpointBaseAsync
        .WithRequest<UserChangePasswordRequest>
        .WithActionResult
    {
        [HttpPost("change-password")]
        public override async Task<ActionResult> HandleAsync(
            [FromBody] UserChangePasswordRequest request,
            CancellationToken cancellationToken = default)
        {
            var userId = myAuthService.GetAuthInfo().UserId;

            var user = await db.Users.FindAsync(
                new object[] { userId },
                cancellationToken);

            if (user == null)
            {
                return NotFound("User not found");
            }

            // Verify current password
            if (!PasswordHelper.VerifyPassword(request.CurrentPassword, user.PasswordHash))
            {
                return BadRequest("Current password is incorrect");
            }

            // Update password
            user.PasswordHash = PasswordHelper.HashPassword(request.NewPassword);
            await db.SaveChangesAsync(cancellationToken);

            return Ok();
        }

        public class UserChangePasswordRequest
        {
            public required string CurrentPassword { get; set; }
            public required string NewPassword { get; set; }
        }
    }
}