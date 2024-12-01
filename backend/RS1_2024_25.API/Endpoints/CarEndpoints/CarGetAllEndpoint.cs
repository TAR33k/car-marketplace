using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Data.Enums;
using RS1_2024_25.API.Helper;
using RS1_2024_25.API.Helper.Api;
using static RS1_2024_25.API.Endpoints.CarEndpoints.CarGetAllEndpoint;

namespace RS1_2024_25.API.Endpoints.CarEndpoints
{
    [Route("cars")]
    public class CarGetAllEndpoint(ApplicationDbContext db) : MyEndpointBaseAsync
        .WithRequest<CarGetAllRequest>
        .WithActionResult<MyPagedList<CarGetAllResponse>>
    {
        [HttpGet]
        public override async Task<ActionResult<MyPagedList<CarGetAllResponse>>> HandleAsync(
            [FromQuery] CarGetAllRequest request,
            CancellationToken cancellationToken = default)
        {
            var query = db.Cars
                .Include(c => c.BodyType)
                .Include(c => c.City)
                    .ThenInclude(city => city.Country)
                .Include(c => c.Model)
                    .ThenInclude(m => m.Manufacturer)
                .AsQueryable();

            // Apply filters
            if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            {
                query = query.Where(c =>
                    c.Name.Contains(request.SearchTerm) ||
                    c.Model.Name.Contains(request.SearchTerm) ||
                    c.Model.Manufacturer.Name.Contains(request.SearchTerm));
            }

            if (request.ManufacturerId.HasValue)
            {
                query = query.Where(c => c.Model.ManufacturerID == request.ManufacturerId);
            }

            if (request.ModelId.HasValue)
            {
                query = query.Where(c => c.ModelID == request.ModelId);
            }

            if (request.MinYear.HasValue)
            {
                query = query.Where(c => c.Year >= request.MinYear);
            }

            if (request.MaxYear.HasValue)
            {
                query = query.Where(c => c.Year <= request.MaxYear);
            }

            if (request.FuelType.HasValue)
            {
                query = query.Where(c => c.FuelType == request.FuelType);
            }

            if (request.Transmission.HasValue)
            {
                query = query.Where(c => c.Transmission == request.Transmission);
            }

            if (request.MinMileage.HasValue)
            {
                query = query.Where(c => c.Mileage >= request.MinMileage);
            }

            if (request.MaxMileage.HasValue)
            {
                query = query.Where(c => c.Mileage <= request.MaxMileage);
            }

            var projectedQuery = query.Select(c => new CarGetAllResponse
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
                BodyTypeName = c.BodyType.Name,
                CityName = c.City.Name,
                CountryName = c.City.Country.Name,
                ModelName = c.Model.Name,
                ManufacturerName = c.Model.Manufacturer.Name
            });

            return await MyPagedList<CarGetAllResponse>.CreateAsync(
                projectedQuery,
                request,  
                cancellationToken);
        }

        public class CarGetAllRequest : MyPagedRequest
        {
            public string? SearchTerm { get; set; }
            public int? ManufacturerId { get; set; }
            public int? ModelId { get; set; }
            public int? MinYear { get; set; }
            public int? MaxYear { get; set; }
            public FuelType? FuelType { get; set; }
            public TransmissionType? Transmission { get; set; }
            public int? MinMileage { get; set; }
            public int? MaxMileage { get; set; }
        }

        public class CarGetAllResponse
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
            public string BodyTypeName { get; set; }
            public string CityName { get; set; }
            public string CountryName { get; set; }
            public string ModelName { get; set; }
            public string ManufacturerName { get; set; }
        }
    }
}