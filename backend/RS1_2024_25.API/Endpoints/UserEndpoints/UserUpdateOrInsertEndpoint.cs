using Microsoft.AspNetCore.Mvc;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Data.Models;
using RS1_2024_25.API.Data.Models.Auth;
using RS1_2024_25.API.Helper;
using RS1_2024_25.API.Helper.Api;
using RS1_2024_25.API.Services;
using static RS1_2024_25.API.Endpoints.UserEndpoints.UserUpdateOrInsertEndpoint;

namespace RS1_2024_25.API.Endpoints.UserEndpoints
{
    [Route("users")]
    public class UserUpdateOrInsertEndpoint(ApplicationDbContext db, MyAuthService myAuthService) : MyEndpointBaseAsync
        .WithRequest<UserUpdateOrInsertRequest>
        .WithActionResult<UserUpdateOrInsertResponse>
    {
        [HttpPost]  // Using POST to support both create and update
        public override async Task<ActionResult<UserUpdateOrInsertResponse>> HandleAsync([FromBody] UserUpdateOrInsertRequest request, CancellationToken cancellationToken = default)
        {
            MyAuthInfo myAuthInfo = myAuthService.GetAuthInfo();
            if (!myAuthInfo.IsLoggedIn)
            {
                return Unauthorized();
            }

            bool isInsert = (request.ID == null || request.ID == 0);
            User? user;

            if (isInsert)
            {
                // Insert operation: create a new user entity
                user = new User();
                db.Users.Add(user); // Add the new user to the context
                user.PasswordHash = PasswordHelper.HashPassword(request.Password); // Hash the password for new user
            }
            else
            {
                // Update operation: retrieve the existing user
                user = await db.Users.FindAsync(new object[] { request.ID }, cancellationToken);

                if (user == null)
                {
                    return NotFound("User not found");
                }

                // Update password only if provided
                if (!string.IsNullOrEmpty(request.Password))
                {
                    user.PasswordHash = PasswordHelper.HashPassword(request.Password);
                }
            }

            // Set common properties for both insert and update operations
            user.Username = request.Username;
            user.FirstName = request.FirstName;
            user.LastName = request.LastName;
            user.PhoneNumber = request.PhoneNumber;
            user.Email = request.Email;
            user.Address = request.Address;

            await db.SaveChangesAsync(cancellationToken);

            return new UserUpdateOrInsertResponse
            {
                ID = user.ID,
                Username = user.Username,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Email = user.Email,
                PhoneNumber = user.PhoneNumber,
                Address = user.Address
            };
        }

        public class UserUpdateOrInsertRequest
        {
            public int? ID { get; set; } // Nullable to allow null for insert operations
            public required string Username { get; set; }
            public required string FirstName { get; set; }
            public required string LastName { get; set; }
            public required string PhoneNumber { get; set; }
            public required string Email { get; set; }
            public required string Address { get; set; }
            public string? Password { get; set; } // Nullable for optional updates
        }

        public class UserUpdateOrInsertResponse
        {
            public required int ID { get; set; }
            public required string Username { get; set; }
            public required string FirstName { get; set; }
            public required string LastName { get; set; }
            public required string Email { get; set; }
            public required string PhoneNumber { get; set; }
            public required string Address { get; set; }
        }
    }
}