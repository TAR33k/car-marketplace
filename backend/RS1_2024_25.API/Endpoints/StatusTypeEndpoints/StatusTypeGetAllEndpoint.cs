using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Helper.Api;
using static RS1_2024_25.API.Endpoints.StatusTypeEndpoints.StatusTypeGetAllEndpoint;

namespace RS1_2024_25.API.Endpoints.StatusTypeEndpoints
{
    [Route("status-types")]
    public class StatusTypeGetAllEndpoint(ApplicationDbContext db) : MyEndpointBaseAsync
        .WithoutRequest
        .WithResult<List<StatusTypeGetAllResponse>>
    {
        [HttpGet]
        public override async Task<List<StatusTypeGetAllResponse>> HandleAsync(
            CancellationToken cancellationToken = default)
        {
            var statusTypes = await db.StatusTypes
                .Select(s => new StatusTypeGetAllResponse
                {
                    ID = s.ID,
                    Name = s.Name
                })
                .ToListAsync(cancellationToken);

            return statusTypes;
        }

        public class StatusTypeGetAllResponse
        {
            public int ID { get; set; }
            public string Name { get; set; }
        }
    }
}