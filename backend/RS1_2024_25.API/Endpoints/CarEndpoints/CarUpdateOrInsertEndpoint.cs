using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Data.Enums;
using RS1_2024_25.API.Data.Models;
using RS1_2024_25.API.Helper.Api;
using RS1_2024_25.API.Services;
using System.ComponentModel.DataAnnotations;
using static RS1_2024_25.API.Endpoints.CarEndpoints.CarUpdateOrInsertEndpoint;

namespace RS1_2024_25.API.Endpoints.CarEndpoints
{
    [Route("cars")]
    public class CarUpdateOrInsertEndpoint(ApplicationDbContext db, MyAuthService myAuthService) : MyEndpointBaseAsync
    .WithRequest<CarUpdateOrInsertRequest>
    .WithActionResult<CarUpdateOrInsertResponse>
    {
        [HttpPost]
        public override async Task<ActionResult<CarUpdateOrInsertResponse>> HandleAsync(
            [FromBody] CarUpdateOrInsertRequest request,
            CancellationToken cancellationToken = default)
        {
            MyAuthInfo myAuthInfo = myAuthService.GetAuthInfo();
            if (!myAuthInfo.IsLoggedIn)
                return Unauthorized("You must be logged in to perform this action.");

            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // Validate relationships
            if (!await db.BodyTypes.AnyAsync(b => b.ID == request.BodyID, cancellationToken))
                return BadRequest($"Invalid BodyID: {request.BodyID}");

            if (!await db.Cities.AnyAsync(c => c.ID == request.CityID, cancellationToken))
                return BadRequest($"Invalid CityID: {request.CityID}");

            if (!await db.CarModels.AnyAsync(m => m.ID == request.ModelID, cancellationToken))
                return BadRequest($"Invalid ModelID: {request.ModelID}");

            var car = request.ID == 0 ? new Car() :
                await db.Cars.FindAsync(new object[] { request.ID }, cancellationToken);

            if (request.ID != 0 && car == null)
                return NotFound($"Car with ID {request.ID} not found.");

            // Validate enum values
            if (!Enum.IsDefined(typeof(FuelType), request.FuelType))
                return BadRequest($"Invalid FuelType: {request.FuelType}");

            if (!Enum.IsDefined(typeof(TransmissionType), request.Transmission))
                return BadRequest($"Invalid Transmission: {request.Transmission}");

            try
            {
                car.Name = request.Name;
                car.Year = request.Year;
                car.EngineCapacity = request.EngineCapacity;
                car.FuelType = request.FuelType;
                car.Transmission = request.Transmission;
                car.Doors = request.Doors;
                car.FuelConsumption = request.FuelConsumption;
                car.Mileage = request.Mileage;
                car.Color = request.Color;
                car.HasServiceHistory = request.HasServiceHistory;
                car.BodyID = request.BodyID;
                car.CityID = request.CityID;
                car.ModelID = request.ModelID;

                if (request.ID == 0)
                    db.Cars.Add(car);

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
                    Mileage = car.Mileage,
                    Color = car.Color,
                    HasServiceHistory = car.HasServiceHistory,
                    BodyID = car.BodyID,
                    CityID = car.CityID,
                    ModelID = car.ModelID
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An unexpected error occurred. Please try again later.");
            }
        }

        public class CarUpdateOrInsertRequest
        {
            public int ID { get; set; }

            [Required]
            [MaxLength(100)]
            public string Name { get; set; }

            [Required]
            [Range(1900, 2100)]
            public int Year { get; set; }

            [Required]
            [Range(0, 10.0)]
            public decimal EngineCapacity { get; set; }

            [Required]
            public FuelType FuelType { get; set; }

            [Required]
            public TransmissionType Transmission { get; set; }

            [Required]
            [Range(2, 8)]
            public int Doors { get; set; }

            [Required]
            [Range(0, 30.0)]
            public decimal FuelConsumption { get; set; }

            [Required]
            [Range(0, 999999)]
            public int Mileage { get; set; }

            [Required]
            [MaxLength(50)]
            public string Color { get; set; }

            public bool HasServiceHistory { get; set; }

            [Required]
            public int BodyID { get; set; }

            [Required]
            public int CityID { get; set; }

            [Required]
            public int ModelID { get; set; }
        }

        public class CarUpdateOrInsertResponse
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
            public int BodyID { get; set; }
            public int CityID { get; set; }
            public int ModelID { get; set; }
        }
    }
}
