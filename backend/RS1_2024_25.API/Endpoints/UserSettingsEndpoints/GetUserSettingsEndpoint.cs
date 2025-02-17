using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Data.Models.Auth;
using RS1_2024_25.API.Helper.Api;
using RS1_2024_25.API.Services;
using static RS1_2024_25.API.Endpoints.UserSettingsEndpoints.GetUserSettingsEndpoint;

namespace RS1_2024_25.API.Endpoints.UserSettingsEndpoints
{
    [Route("settings")]
    public class GetUserSettingsEndpoint(ApplicationDbContext db, MyAuthService myAuthService) : MyEndpointBaseAsync
    .WithoutRequest
    .WithResult<ActionResult<UserSettingsResponse>>
    {
        [HttpGet]
        public override async Task<ActionResult<UserSettingsResponse>> HandleAsync(CancellationToken cancellationToken = default)
        {
            MyAuthInfo myAuthInfo = myAuthService.GetAuthInfo();
            if (!myAuthInfo.IsLoggedIn)
            {
                return Unauthorized();
            }

            var user = await db.Users
                .FirstOrDefaultAsync(s => s.ID == myAuthInfo.UserId, cancellationToken);

            if (user == null)
                return BadRequest("Invalid user.");

            await db.EnsureUserSettingsExistAsync(myAuthInfo.UserId);

            var settings = await db.UserSettings
                .Where(s => s.UserID == myAuthInfo.UserId)
                .Select(s => new UserSettingsResponse
                {
                    ID = s.ID,
                    User = user,
                    showEmail = s.showEmail,
                    showPhone = s.showPhone,
                    showLocation = s.showLocation
                })
                .FirstOrDefaultAsync(cancellationToken);

            return settings!;
        }

        public class UserSettingsResponse
        {
            public required int ID { get; set; }
            public required User User { get; set; }
            public required bool showEmail { get; set; }
            public required bool showPhone { get; set; }
            public required bool showLocation { get; set; }
        }
    }
}
