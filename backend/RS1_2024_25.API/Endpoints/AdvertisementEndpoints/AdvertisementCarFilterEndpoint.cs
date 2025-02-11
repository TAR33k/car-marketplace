using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Data.Enums;
using RS1_2024_25.API.Data.Models;
using RS1_2024_25.API.Data.Models.Ad.Advertisement;
using RS1_2024_25.API.Helper;
using RS1_2024_25.API.Helper.Api;

namespace RS1_2024_25.API.Endpoints.AdvertisementEndpoints
{
    [Route("advertisements/filter")]
    public class AdvertisementCarFilterEndpoint : MyEndpointBaseAsync
        .WithRequest<AdvertisementFilterRequest>
        .WithResult<MyPagedList<AdvertisementFilterResponse>>
    {
        private readonly ApplicationDbContext _db;

        public AdvertisementCarFilterEndpoint(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet]
        public override async Task<MyPagedList<AdvertisementFilterResponse>> HandleAsync(
            [FromQuery] AdvertisementFilterRequest request,
            CancellationToken cancellationToken = default)
        {
            // Initialize default request if null
            request ??= new AdvertisementFilterRequest
            {
                PageNumber = 1,
                PageSize = 12
            };

            var query = _db.Advertisements
                .Include(a => a.Car)
                    .ThenInclude(c => c.Model)
                        .ThenInclude(m => m.Manufacturer)
                .Include(a => a.Car.BodyType)
                .Include(a => a.Status)
                .Include(a => a.User)
                .Include(a => a.Images)
                .AsQueryable();

            // Apply filters
            query = ApplyFilters(query, request);

            // Apply sorting
            query = ApplySorting(query, request.SortBy);

            // Project to response
            var projectedQuery = query.Select(a => new AdvertisementFilterResponse
            {
                Id = a.ID,
                Title = a.Title,
                Description = a.Description,
                Price = a.Price,
                Condition = a.Condition,
                ListingDate = a.ListingDate,
                ExpirationDate = a.ExpirationDate,
                ViewCount = a.ViewCount,
                StatusId = a.StatusID,
                StatusName = a.Status.Name,
                PrimaryImageUrl = a.Images
                    .Where(i => i.IsPrimary)
                    .Select(i => i.ImageUrl)
                    .FirstOrDefault(),
                Images = a.Images
                    .Where(i => !i.IsPrimary)
                    .Select(i => i.ImageUrl)
                    .ToList(),
                ImageCount = a.Images
                    .ToList().Count(),
                // Car details
                CarId = a.Car.ID,
                CarName = a.Car.Name,
                Make = a.Car.Model.Manufacturer.Name,
                Model = a.Car.Model.Name,
                Year = a.Car.Year,
                Mileage = a.Car.Mileage,
                FuelType = a.Car.FuelType,
                Transmission = a.Car.Transmission,
                BodyType = a.Car.BodyType.Name,
                // User details
                UserId = a.UserID,
                UserName = $"{a.User.FirstName} {a.User.LastName}",
                UserEmail = a.User.Email,
                UserPhone = a.User.PhoneNumber
            });

            return await MyPagedList<AdvertisementFilterResponse>.CreateAsync(
                projectedQuery, request, cancellationToken);
        }

        private static IQueryable<Advertisement> ApplyFilters(
            IQueryable<Advertisement> query,
            AdvertisementFilterRequest request)
        {
            if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            {
                var searchTerm = request.SearchTerm.ToLower();
                query = query.Where(a =>
                    a.Title.ToLower().Contains(searchTerm) ||
                    a.Car.Model.Manufacturer.Name.ToLower().Contains(searchTerm) ||
                    a.Car.Model.Name.ToLower().Contains(searchTerm) ||
                    a.Description.ToLower().Contains(searchTerm));
            }

            if (request.Condition.HasValue)
            {
                query = query.Where(a => a.Condition == request.Condition);
            }

            if (request.MinPrice.HasValue)
            {
                query = query.Where(a => a.Price >= request.MinPrice.Value);
            }

            if (request.MaxPrice.HasValue)
            {
                query = query.Where(a => a.Price <= request.MaxPrice.Value);
            }

            if (request.StatusId.HasValue)
            {
                query = query.Where(a => a.StatusID == request.StatusId.Value);
            }

            if (!string.IsNullOrWhiteSpace(request.Make))
            {
                query = query.Where(a =>
                    a.Car.Model.Manufacturer.Name.ToLower() == request.Make.ToLower());
            }

            if (!string.IsNullOrWhiteSpace(request.Model))
            {
                query = query.Where(a =>
                    a.Car.Model.Name.ToLower() == request.Model.ToLower());
            }

            if (request.FuelType.HasValue)
            {
                query = query.Where(a => a.Car.FuelType == request.FuelType.Value);
            }

            if (request.Transmission.HasValue)
            {
                query = query.Where(a => a.Car.Transmission == request.Transmission.Value);
            }

            if (request.YearFrom.HasValue)
            {
                query = query.Where(a => a.Car.Year >= request.YearFrom.Value);
            }

            if (request.YearTo.HasValue)
            {
                query = query.Where(a => a.Car.Year <= request.YearTo.Value);
            }

            if (request.BodyTypeId.HasValue)
            {
                query = query.Where(a => a.Car.BodyID == request.BodyTypeId.Value);
            }

            if (request.MileageTo.HasValue)
            {
                query = query.Where(a => a.Car.Mileage <= request.MileageTo.Value);
            }

            return query;
        }

        private static IQueryable<Advertisement> ApplySorting(
        IQueryable<Advertisement> query,
        string? sortBy)
        {
            return sortBy?.ToLower() switch
            {
                "newest" => query.OrderByDescending(a => a.ListingDate),
                "price_asc" => query.OrderBy(a => a.Price),
                "price_desc" => query.OrderByDescending(a => a.Price),
                "most_viewed" => query.OrderByDescending(a => a.ViewCount)
                    .ThenByDescending(a => a.ListingDate), // Secondary sort by date
                _ => query.OrderByDescending(a => a.ListingDate) // Default sorting
            };
        }
    }

    public class AdvertisementFilterRequest : MyPagedRequest
    {
        public string? SearchTerm { get; set; }
        public VehicleCondition? Condition { get; set; }
        public decimal? MinPrice { get; set; }
        public decimal? MaxPrice { get; set; }
        public int? StatusId { get; set; }
        public string? SortBy { get; set; }
        public string? Make { get; set; }
        public string? Model { get; set; }
        public FuelType? FuelType { get; set; }
        public TransmissionType? Transmission { get; set; }
        public int? YearFrom { get; set; }
        public int? YearTo { get; set; }
        public int? BodyTypeId { get; set; }
        public int? MileageTo { get; set; }
    }

    public class AdvertisementFilterResponse
    {
        // Advertisement details
        public int Id { get; set; }
        public string Title { get; set; } = string.Empty;
        public string Description { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public VehicleCondition Condition { get; set; }
        public DateTime ListingDate { get; set; }
        public DateTime? ExpirationDate { get; set; }
        public int ViewCount { get; set; }
        public int StatusId { get; set; }
        public string StatusName { get; set; } = string.Empty;
        public string? PrimaryImageUrl { get; set; }
        public List<string> Images { get; set; } = new();
        public int ImageCount { get; set; }

        // Car details
        public int CarId { get; set; }
        public string CarName { get; set; } = string.Empty;
        public string Make { get; set; } = string.Empty;
        public string Model { get; set; } = string.Empty;
        public int Year { get; set; }
        public int Mileage { get; set; }
        public FuelType FuelType { get; set; }
        public TransmissionType Transmission { get; set; }
        public string BodyType { get; set; } = string.Empty;

        // User details
        public int UserId { get; set; }
        public string UserName { get; set; } = string.Empty;
        public string UserEmail { get; set; } = string.Empty;
        public string? UserPhone { get; set; }
    }
}