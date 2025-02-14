using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Helper.Api;
using RS1_2024_25.API.Hubs;
using static RS1_2024_25.API.Endpoints.UserEndpoints.UserStatusEndpoint;

namespace RS1_2024_25.API.Endpoints.UserEndpoints
{
    [Route("users")]
    public class UserStatusEndpoint : MyEndpointBaseAsync
    .WithoutRequest
    .WithActionResult<List<UserStatusResponse>>
    {
        private readonly ApplicationDbContext _db;

        public UserStatusEndpoint(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet("status")]
        public override async Task<ActionResult<List<UserStatusResponse>>> HandleAsync(CancellationToken cancellationToken = default)
        {
            var users = await _db.Users
                .Select(u => new UserStatusResponse
                {
                    UserId = u.ID,
                    IsOnline = u.IsOnline,
                    LastSeen = u.LastSeen
                })
                .ToListAsync(cancellationToken);

            return Ok(users);
        }

        public class UserStatusResponse
        {
            public int UserId { get; set; }
            public bool IsOnline { get; set; }
            public DateTime? LastSeen { get; set; }
        }
    }
}
