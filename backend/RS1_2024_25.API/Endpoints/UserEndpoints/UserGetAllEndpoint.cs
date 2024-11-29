using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Helper.Api;
using static RS1_2024_25.API.Endpoints.UserEndpoints.UserGetAllEndpoint;

namespace RS1_2024_25.API.Endpoints.UserEndpoints
{
    // Basic GET endpoint for retrieving all users without paging or filtering
    [Route("users")]
    public class UserGetAllEndpoint(ApplicationDbContext db) : MyEndpointBaseAsync
        .WithoutRequest
        .WithResult<UserGetAllResponse[]>
    {
        [HttpGet("all")]
        public override async Task<UserGetAllResponse[]> HandleAsync(CancellationToken cancellationToken = default)
        {
            var result = await db.Users
                            .Select(u => new UserGetAllResponse
                            {
                                ID = u.ID,
                                Username = u.Username,
                                FirstName = u.FirstName,
                                LastName = u.LastName,
                                Email = u.Email,
                                PasswordHash = u.PasswordHash,
                                Address = u.Address,
                                PhoneNumber = u.PhoneNumber,
                                IsAdmin = u.IsAdmin
                            })
                            .ToArrayAsync(cancellationToken);

            return result;
        }

        public class UserGetAllResponse
        {
            public required int ID { get; set; }
            public required string Username { get; set; }
            public required string FirstName { get; set; }
            public required string LastName { get; set; }
            public required string Email { get; set; }
            public required string PasswordHash { get; set; }
            public required string Address { get; set; }
            public required string PhoneNumber { get; set; }
            public required bool IsAdmin { get; set; }
        }
    }
}
