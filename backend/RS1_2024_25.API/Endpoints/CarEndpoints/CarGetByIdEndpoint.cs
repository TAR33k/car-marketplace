using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Data.Enums;
using RS1_2024_25.API.Helper.Api;
using static RS1_2024_25.API.Endpoints.CarEndpoints.CarGetByIdEndpoint;

namespace RS1_2024_25.API.Endpoints.CarEndpoints
{
    [Route("cars")]
    public class CarGetByIdEndpoint(ApplicationDbContext db) : MyEndpointBaseAsync
        .WithRequest<int>
        .WithActionResult<CarGetByIdResponse>
    {
        [HttpGet("{id}")]
        public override async Task<ActionResult<CarGetByIdResponse>> HandleAsync(
            int id, 
            CancellationToken cancellationToken = default)
        {
            var car = await db.Cars
                .Include(c => c.BodyType)
                .Include(c => c.City)
                    .ThenInclude(city => city.Country)
                .Include(c => c.Model)
                    .ThenInclude(m => m.Manufacturer)
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
                    Mileage = c.Mileage,
                    Color = c.Color,
                    HasServiceHistory = c.HasServiceHistory,
                    BodyType = new CarGetByIdResponse.BodyTypeResponse
                    {
                        ID = c.BodyType.ID,
                        Name = c.BodyType.Name
                    },
                    Location = new CarGetByIdResponse.LocationResponse
                    {
                        CityID = c.City.ID,
                        CityName = c.City.Name,
                        CountryName = c.City.Country.Name
                    },
                    Model = new CarGetByIdResponse.ModelResponse
                    {
                        ID = c.Model.ID,
                        Name = c.Model.Name,
                        Manufacturer = new CarGetByIdResponse.ManufacturerResponse
                        {
                            ID = c.Model.Manufacturer.ID,
                            Name = c.Model.Manufacturer.Name,
                            Country = c.Model.Manufacturer.Country
                        }
                    }
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (car == null)
                return NotFound();

            return car;
        }

        public class CarGetByIdResponse
        {
            public int ID { get; set; }
            public string Name { get; set; }
            public int Year { get; set; }
            public decimal EngineCapacity { get; set; }
            public FuelType FuelType { get; set; }
            public TransmissionType Transmission { get; set; }
            public int Doors { get; set; }
            public decimal FuelConsumption { get; set; }
            public int Mileage { get; set; }
            public string Color { get; set; }
            public bool HasServiceHistory { get; set; }
            public BodyTypeResponse BodyType { get; set; }
            public LocationResponse Location { get; set; }
            public ModelResponse Model { get; set; }

            public class BodyTypeResponse
            {
                public int ID { get; set; }
                public string Name { get; set; }
            }

            public class LocationResponse
            {
                public int CityID { get; set; }
                public string CityName { get; set; }
                public string CountryName { get; set; }
            }

            public class ModelResponse
            {
                public int ID { get; set; }
                public string Name { get; set; }
                public ManufacturerResponse Manufacturer { get; set; }
            }

            public class ManufacturerResponse
            {
                public int ID { get; set; }
                public string Name { get; set; }
                public string Country { get; set; }
            }
        }
    }
}