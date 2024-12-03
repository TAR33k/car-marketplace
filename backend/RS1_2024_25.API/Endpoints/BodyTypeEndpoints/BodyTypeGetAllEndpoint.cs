// Endpoints/BodyTypeEndpoints/BodyTypeGetAllEndpoint.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Helper.Api;
using static RS1_2024_25.API.Endpoints.BodyTypeEndpoints.BodyTypeGetAllEndpoint;

namespace RS1_2024_25.API.Endpoints.BodyTypeEndpoints
{
    [Route("body-types")]
    public class BodyTypeGetAllEndpoint(ApplicationDbContext db) : MyEndpointBaseAsync
        .WithoutRequest
        .WithResult<BodyTypeGetAllResponse[]>
    {
        [HttpGet("all")]
        public override async Task<BodyTypeGetAllResponse[]> HandleAsync(CancellationToken cancellationToken = default)
        {
            var result = await db.BodyTypes
                            .Select(b => new BodyTypeGetAllResponse
                            {
                                ID = b.ID,
                                Name = b.Name
                            })
                            .ToArrayAsync(cancellationToken);

            return result;
        }

        public class BodyTypeGetAllResponse
        {
            public required int ID { get; set; }
            public required string Name { get; set; }
        }
    }
}