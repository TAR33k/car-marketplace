using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Helper.Api;
using static RS1_2024_25.API.Endpoints.CarModelEndpoints.CarModelGetByManufacturerEndpoint;

namespace RS1_2024_25.API.Endpoints.CarModelEndpoints
{
    [Route("car-models")]
    public class CarModelGetByManufacturerEndpoint(ApplicationDbContext db) : MyEndpointBaseAsync
        .WithRequest<int>
        .WithResult<CarModelGetByManufacturerResponse[]>
    {
        [HttpGet("by-manufacturer/{id}")]
        public override async Task<CarModelGetByManufacturerResponse[]> HandleAsync(int id, CancellationToken cancellationToken = default)
        {
            var result = await db.CarModels
                .Include(m => m.Manufacturer)
                .Where(m => m.ManufacturerID == id)
                .Select(m => new CarModelGetByManufacturerResponse
                {
                    ID = m.ID,
                    Name = m.Name,
                    Description = m.Description,
                    StartYear = m.StartYear,
                    EndYear = m.EndYear,
                    ManufacturerID = m.ManufacturerID,
                    ManufacturerName = m.Manufacturer.Name
                })
                .ToArrayAsync(cancellationToken);

            return result;
        }

        public class CarModelGetByManufacturerResponse
        {
            public required int ID { get; set; }
            public required string Name { get; set; }
            public string? Description { get; set; }
            public required int StartYear { get; set; }
            public int? EndYear { get; set; }
            public required int ManufacturerID { get; set; }
            public required string ManufacturerName { get; set; }
        }
    }
}