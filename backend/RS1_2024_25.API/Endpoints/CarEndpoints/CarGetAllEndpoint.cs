using Microsoft.AspNetCore.Mvc;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Helper.Api;
using RS1_2024_25.API.Helper;
using static CarGetAllEndpoint;
using Microsoft.EntityFrameworkCore;

[Route("cars")]
public class CarGetAllEndpoint(ApplicationDbContext db) : MyEndpointBaseAsync
    .WithRequest<CarGetAllRequest>
    .WithResult<List<CarGetAllResponse>>  
{
    [HttpGet("filter")]
    public override async Task<List<CarGetAllResponse>> HandleAsync(
        [FromQuery] CarGetAllRequest request,
        CancellationToken cancellationToken = default)
    {
        var query = db.Cars
            .Include(c => c.BodyType)
            .Include(c => c.City)
            .AsQueryable();

     
        if (!string.IsNullOrWhiteSpace(request.FilterCarName))
        {
            query = query.Where(c => c.Name.Contains(request.FilterCarName));
        }

        if (request.FilterYear.HasValue)
        {
            query = query.Where(c => c.Year == request.FilterYear.Value);
        }

        if (!string.IsNullOrWhiteSpace(request.FilterFuelType))
        {
            query = query.Where(c => c.FuelType.Contains(request.FilterFuelType));
        }

        if (!string.IsNullOrWhiteSpace(request.FilterTransmission))
        {
            query = query.Where(c => c.Transmission.Contains(request.FilterTransmission));
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
            BodyTypeName = c.BodyType != null ? c.BodyType.Name : "",
            CityName = c.City != null ? c.City.Name : ""
        });

       
        var paginatedQuery = projectedQuery
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize);

       
        var result = await paginatedQuery.ToListAsync(cancellationToken);

        return result;  
    }

    public class CarGetAllRequest : MyPagedRequest
    {
        public string FilterCarName { get; set; } = string.Empty;
        public int? FilterYear { get; set; }
        public string FilterFuelType { get; set; } = string.Empty;
        public string FilterTransmission { get; set; } = string.Empty;
    }

    public class CarGetAllResponse
    {
        public required int ID { get; set; }
        public required string Name { get; set; }
        public required int Year { get; set; }
        public required decimal EngineCapacity { get; set; }
        public required string FuelType { get; set; }
        public required string Transmission { get; set; }
        public required int Doors { get; set; }
        public required decimal FuelConsumption { get; set; }
        public required string BodyTypeName { get; set; }
        public required string CityName { get; set; }
    }
}
