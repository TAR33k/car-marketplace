using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Helper.Api;
using static RS1_2024_25.API.Endpoints.UserEndpoints.UserGetByIdEndpoint;

namespace RS1_2024_25.API.Endpoints.UserEndpoints;

[Route("users")]
public class UserGetByIdEndpoint(ApplicationDbContext db) : MyEndpointBaseAsync
    .WithRequest<int>
    .WithResult<UserGetByIdResponse>
{
    [HttpGet("{id}")]
    public override async Task<UserGetByIdResponse> HandleAsync(int id, CancellationToken cancellationToken = default)
    {
        var user = await db.Users
                            .Where(u => u.ID == id)
                            .Select(u => new UserGetByIdResponse
                            {
                                ID = u.ID,
                                Username = u.Username,
                                FirstName = u.FirstName,
                                LastName = u.LastName,
                                PhoneNumber = u.PhoneNumber,
                                Email = u.Email,
                                Address = u.Address,
                                PasswordHash = u.PasswordHash,
                                IsAdmin = u.IsAdmin
                            })
                            .FirstOrDefaultAsync(x => x.ID == id, cancellationToken);

        if (user == null)
            throw new KeyNotFoundException("User not found");

        return user;
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
        public required bool IsAdmin { get; set; }
    }
}