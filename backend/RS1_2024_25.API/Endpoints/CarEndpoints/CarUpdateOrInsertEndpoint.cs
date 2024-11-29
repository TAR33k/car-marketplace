using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Data.Models;
using RS1_2024_25.API.Helper.Api;
using RS1_2024_25.API.Services;
using static RS1_2024_25.API.Endpoints.CarEndpoints.CarUpdateOrInsertEndpoint;

namespace RS1_2024_25.API.Endpoints.CarEndpoints
{
    [Route("cars")]
    public class CarUpdateOrInsertEndpoint(ApplicationDbContext db, MyAuthService myAuthService) : MyEndpointBaseAsync
        .WithRequest<CarUpdateOrInsertRequest>
        .WithActionResult<CarUpdateOrInsertResponse>
    {
        [HttpPost] 
        public override async Task<ActionResult<CarUpdateOrInsertResponse>> HandleAsync([FromBody] CarUpdateOrInsertRequest request, CancellationToken cancellationToken = default)
        {
            MyAuthInfo myAuthInfo = myAuthService.GetAuthInfo();
            if (!myAuthInfo.IsLoggedIn)
            {
                return Unauthorized("You must be logged in to perform this action.");
            }

            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            if (!await db.BodyTypes.AnyAsync(b => b.ID == request.BodyID, cancellationToken))
            {
                return BadRequest($"Invalid BodyID: {request.BodyID}");
            }

            if (!await db.Cities.AnyAsync(c => c.ID == request.CityID, cancellationToken))
            {
                return BadRequest($"Invalid CityID: {request.CityID}");
            }

            bool isInsert = (request.ID == null || request.ID == 0);
            Car? car;

            if (isInsert)
            {
                car = new Car();
                db.Cars.Add(car); 
            }
            else
            {
                car = await db.Cars.FindAsync(new object[] { request.ID }, cancellationToken);

                if (car == null)
                {
                    return NotFound($"Car with ID {request.ID} not found.");
                }
            }

            if (await db.Cars.AnyAsync(c => c.Name == request.Name && c.ID != request.ID, cancellationToken))
            {
                return BadRequest($"A car with the name '{request.Name}' already exists.");
            }

            try
            {
                car.Name = request.Name;
                car.Year = request.Year;
                car.EngineCapacity = request.EngineCapacity;
                car.FuelType = request.FuelType;
                car.Transmission = request.Transmission;
                car.Doors = request.Doors;
                car.FuelConsumption = request.FuelConsumption;
                car.BodyID = request.BodyID;
                car.CityID = request.CityID;

                await db.SaveChangesAsync(cancellationToken);

                return new CarUpdateOrInsertResponse
                {
                    ID = car.ID,
                    Name = car.Name,
                    Year = car.Year,
                    EngineCapacity = car.EngineCapacity,
                    FuelType = car.FuelType,
                    Transmission = car.Transmission,
                    Doors = car.Doors,
                    FuelConsumption = car.FuelConsumption,
                    BodyID = car.BodyID,
                    CityID = car.CityID
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error occurred: {ex.Message}");

                return StatusCode(500, "An unexpected error occurred. Please try again later.");
            }
        }

        public class CarUpdateOrInsertRequest
        {
            public int? ID { get; set; } 
            public required string Name { get; set; }
            public required int Year { get; set; }
            public required decimal EngineCapacity { get; set; }
            public required string FuelType { get; set; }
            public required string Transmission { get; set; }
            public required int Doors { get; set; }
            public required decimal FuelConsumption { get; set; }
            public required int BodyID { get; set; } 
            public required int CityID { get; set; } 
        }

        public class CarUpdateOrInsertResponse
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
        }
    }
}
