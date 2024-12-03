using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Helper.Api;
using static RS1_2024_25.API.Endpoints.CarModelEndpoints.CarModelGetAllEndpoint;

namespace RS1_2024_25.API.Endpoints.CarModelEndpoints
{
    [Route("car-models")]
    public class CarModelGetAllEndpoint(ApplicationDbContext db) : MyEndpointBaseAsync
        .WithoutRequest
        .WithResult<CarModelGetAllResponse[]>
    {
        [HttpGet("all")]
        public override async Task<CarModelGetAllResponse[]> HandleAsync(CancellationToken cancellationToken = default)
        {
            var result = await db.CarModels
                .Include(m => m.Manufacturer)
                .Select(m => new CarModelGetAllResponse
                {
                    ID = m.ID,
                    Name = m.Name,
                    Description = m.Description,
                    StartYear = m.StartYear,
                    EndYear = m.EndYear,
                    ManufacturerID = m.ManufacturerID,
                    ManufacturerName = m.Manufacturer.Name,
                    ManufacturerCountry = m.Manufacturer.Country,
                    ManufacturerLogo = m.Manufacturer.LogoUrl
                })
                .ToArrayAsync(cancellationToken);

            return result;
        }

        public class CarModelGetAllResponse
        {
            public required int ID { get; set; }
            public required string Name { get; set; }
            public string? Description { get; set; }
            public required int StartYear { get; set; }
            public int? EndYear { get; set; }
            public required int ManufacturerID { get; set; }
            public required string ManufacturerName { get; set; }
            public string? ManufacturerCountry { get; set; }
            public string? ManufacturerLogo { get; set; }
        }
    }
}