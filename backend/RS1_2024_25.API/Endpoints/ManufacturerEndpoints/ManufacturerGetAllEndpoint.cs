using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Helper.Api;
using static RS1_2024_25.API.Endpoints.ManufacturerEndpoints.ManufacturerGetAllEndpoint;

namespace RS1_2024_25.API.Endpoints.ManufacturerEndpoints
{
    [Route("manufacturers")]
    public class ManufacturerGetAllEndpoint(ApplicationDbContext db) : MyEndpointBaseAsync
        .WithoutRequest
        .WithResult<ManufacturerGetAllResponse[]>
    {
        [HttpGet("all")]
        public override async Task<ManufacturerGetAllResponse[]> HandleAsync(CancellationToken cancellationToken = default)
        {
            var result = await db.Manufacturers
                .Select(m => new ManufacturerGetAllResponse
                {
                    ID = m.ID,
                    Name = m.Name,
                    Description = m.Description,
                    LogoUrl = m.LogoUrl,
                    Country = m.Country,
                    YearFounded = m.YearFounded
                })
                .ToArrayAsync(cancellationToken);

            return result;
        }

        public class ManufacturerGetAllResponse
        {
            public required int ID { get; set; }
            public required string Name { get; set; }
            public string? Description { get; set; }
            public string? LogoUrl { get; set; }
            public string? Country { get; set; }
            public required int YearFounded { get; set; }
        }
    }
}