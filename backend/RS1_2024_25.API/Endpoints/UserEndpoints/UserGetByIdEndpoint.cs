using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Helper.Api;
using RS1_2024_25.API.Services;
using static RS1_2024_25.API.Endpoints.UserEndpoints.UserGetByIdEndpoint;

namespace RS1_2024_25.API.Endpoints.UserEndpoints;

[Route("users")]
public class UserGetByIdEndpoint(ApplicationDbContext db, MyAuthService myAuthService) : MyEndpointBaseAsync
    .WithRequest<int>
    .WithResult<UserGetByIdResponse>
{
    [HttpGet("{id}")]
    public override async Task<UserGetByIdResponse> HandleAsync(int id, CancellationToken cancellationToken = default)
    {
        bool isAdminOrOwner = false;

        var myAuthInfo = myAuthService.GetAuthInfo();

        if (myAuthInfo != null)
        {
            isAdminOrOwner = myAuthInfo.IsLoggedIn && (myAuthInfo.UserId == id || myAuthInfo.IsAdmin);
        }

        var userWithSettings = await db.Users
            .Select(u => new
            {
                User = u,
                Settings = db.UserSettings.FirstOrDefault(s => s.UserID == u.ID)
            })
            .FirstOrDefaultAsync(x => x.User.ID == id, cancellationToken);

        if (userWithSettings == null)
            throw new KeyNotFoundException("User not found");

        var user = userWithSettings.User;
        var settings = userWithSettings.Settings;

        // If settings don't exist, create default ones
        if (settings == null)
        {
            await db.EnsureUserSettingsExistAsync(id);
            settings = await db.UserSettings.FirstOrDefaultAsync(s => s.UserID == id, cancellationToken);
        }

        const string HIDDEN_INFO = "[Hidden]";

        return new UserGetByIdResponse
        {
            ID = user.ID,
            Username = user.Username,
            FirstName = user.FirstName,
            LastName = user.LastName,
            PhoneNumber = isAdminOrOwner || settings!.showPhone ? user.PhoneNumber : HIDDEN_INFO,
            Email = isAdminOrOwner || settings!.showEmail ? user.Email : HIDDEN_INFO,
            Address = isAdminOrOwner || settings!.showLocation ? user.Address : HIDDEN_INFO,
            PasswordHash = isAdminOrOwner ? user.PasswordHash : HIDDEN_INFO,
            LastSeen = user.LastSeen,
            CreatedAt = user.CreatedAt,
            IsAdmin = user.IsAdmin
        };
    }

    public class UserGetByIdResponse
    {
        public required int ID { get; set; }
        public required string Username { get; set; }
        public required string FirstName { get; set; }
        public required string LastName { get; set; }
        public required string PhoneNumber { get; set; }
        public required string Email { get; set; }
        public required string Address { get; set; }
        public required string PasswordHash { get; set; }
        public DateTime? LastSeen { get; set; }
        public required DateTime CreatedAt { get; set; }
        public required bool IsAdmin { get; set; }
    }
}