using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Data.Models;
using RS1_2024_25.API.Data.Models.Auth;
using RS1_2024_25.API.Helper.Api;
using RS1_2024_25.API.Services;
using static RS1_2024_25.API.Endpoints.UserSettingsEndpoints.SetUserSettingsEndpoint;

namespace RS1_2024_25.API.Endpoints.UserSettingsEndpoints
{
    [Route("settings")]
    public class SetUserSettingsEndpoint(ApplicationDbContext db, MyAuthService myAuthService) : MyEndpointBaseAsync
    .WithRequest<UserSettingsRequest>
    .WithResult<ActionResult<SetUserSettingsResponse>>
    {
        [HttpPost]
        public override async Task<ActionResult<SetUserSettingsResponse>> HandleAsync(UserSettingsRequest request, CancellationToken cancellationToken = default)
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

            Settings? settings;

            settings = await db.UserSettings
                                .Where(s => s.UserID == myAuthInfo.UserId)
                                .FirstOrDefaultAsync(x => x.User.ID == myAuthInfo.UserId, cancellationToken);

            if (settings == null)
            {
                settings = new Settings();
                db.UserSettings.Add(settings);
            }

            settings.User = user;
            settings.UserID = myAuthInfo.UserId;
            settings.showEmail = request.showEmail;
            settings.showPhone = request.showPhone;
            settings.showLocation = request.showLocation;

            await db.SaveChangesAsync(cancellationToken);

            return new SetUserSettingsResponse
            {
                ID = settings.ID,
                User = settings.User,
                showEmail = settings.showEmail,
                showPhone = settings.showPhone,
                showLocation = settings.showLocation
            };
        }

        public class UserSettingsRequest
        {
            public bool showEmail { get; set; }
            public bool showPhone { get; set; }
            public bool showLocation { get; set; }
        }

        public class SetUserSettingsResponse
        {
            public required int ID { get; set; }
            public required User User { get; set; }
            public required bool showEmail { get; set; }
            public required bool showPhone { get; set; }
            public required bool showLocation { get; set; }
        }
    }
}
