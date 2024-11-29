using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Helper.Api;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using static RS1_2024_25.API.Endpoints.CarEndpoints.CarGetByIdEndpoint;

namespace RS1_2024_25.API.Endpoints.CarEndpoints
{
    [Route("cars")]
    public class CarGetByIdEndpoint(ApplicationDbContext db) : MyEndpointBaseAsync
        .WithRequest<int>  
        .WithResult<CarGetByIdResponse>  
    {
        [HttpGet("{id}")]
        public override async Task<CarGetByIdResponse> HandleAsync(int id, CancellationToken cancellationToken = default)
        {
            var car = await db.Cars
                .Include(c => c.BodyType)  
                .Include(c => c.City)      
                .Where(c => c.ID == id)
                .Select(c => new CarGetByIdResponse
                {
                    ID = c.ID,
                    Name = c.Name,
                    Year = c.Year,
                    EngineCapacity = c.EngineCapacity,
                    FuelType = c.FuelType,
                    Transmission = c.Transmission,
                    Doors = c.Doors,
                    FuelConsumption = c.FuelConsumption,
                    BodyID = c.BodyID,
                    CityID = c.CityID,
                    BodyTypeName = c.BodyType.Name,  
                    CityName = c.City.Name  
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (car == null)
                throw new KeyNotFoundException("Car not found");

            return car;
        }

        public class CarGetByIdResponse
        {
            public required int ID { get; set; }
            public required string Name { get; set; }
            public required int Year { get; set; }
            public required decimal EngineCapacity { get; set; }
            public required string FuelType { get; set; }
            public required string Transmission { get; set; }
            public required int Doors { get; set; }
            public required decimal FuelConsumption { get; set; }
            public required int BodyID { get; set; }
            public required int CityID { get; set; }
            public required string BodyTypeName { get; set; }  
            public required string CityName { get; set; }  
        }
    }
}
