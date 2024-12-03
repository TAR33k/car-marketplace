using Microsoft.AspNetCore.Mvc;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Helper.Api;
using RS1_2024_25.API.Helper;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data.Enums;
using static RS1_2024_25.API.Endpoints.AdvertisementEndpoints.AdvertisementGetAllEndpoint;

namespace RS1_2024_25.API.Endpoints.AdvertisementEndpoints
{
    [Route("advertisements")]
    public class AdvertisementGetAllEndpoint(ApplicationDbContext db) : MyEndpointBaseAsync
    .WithRequest<AdvertGetAllRequest>
    .WithResult<MyPagedList<AdvertGetAllResponse>>
    {
        [HttpGet]
        public override async Task<MyPagedList<AdvertGetAllResponse>> HandleAsync(
            [FromQuery] AdvertGetAllRequest request,
            CancellationToken cancellationToken = default)
        {
            // Validate and clean the request
            if (request == null)
            {
                request = new AdvertGetAllRequest
                {
                    PageNumber = 1,
                    PageSize = 10
                };
            }

            var query = db.Advertisements
                .Include(a => a.Car)
                .Include(a => a.Status)
                .Include(a => a.User)
                .AsQueryable();

            // Only apply filters if they have values
            if (!string.IsNullOrWhiteSpace(request.SearchTerm))
            {
                query = query.Where(a =>
                    a.Title.Contains(request.SearchTerm) ||
                    a.Description.Contains(request.SearchTerm));
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

            if (request.StatusID.HasValue)
            {
                query = query.Where(a => a.StatusID == request.StatusID.Value);
            }

            var projectedQuery = query.Select(a => new AdvertGetAllResponse
            {
                ID = a.ID,
                Title = a.Title,
                Condition = a.Condition,
                Price = a.Price,
                ListingDate = a.ListingDate,
                ExpirationDate = a.ExpirationDate,
                ViewCount = a.ViewCount,
                Status = a.Status.Name,
                CarName = a.Car.Name,
                UserName = $"{a.User.FirstName} {a.User.LastName}",
                PrimaryImageUrl = a.Images
                    .Where(i => i.IsPrimary)
                    .Select(i => i.ImageUrl)
                    .FirstOrDefault()
            });

            return await MyPagedList<AdvertGetAllResponse>.CreateAsync(
                projectedQuery, request, cancellationToken);
        }

        public class AdvertGetAllRequest : MyPagedRequest
        {
            public string? SearchTerm { get; set; }
            public VehicleCondition? Condition { get; set; }
            public decimal? MinPrice { get; set; }
            public decimal? MaxPrice { get; set; }
            public int? StatusID { get; set; }
        }

        public class AdvertGetAllResponse
        {
            public int ID { get; set; }
            public string Title { get; set; }
            public VehicleCondition Condition { get; set; }
            public decimal Price { get; set; }
            public DateTime ListingDate { get; set; }
            public DateTime? ExpirationDate { get; set; }
            public int ViewCount { get; set; }
            public string Status { get; set; }
            public string CarName { get; set; }
            public string UserName { get; set; }
            public string? PrimaryImageUrl { get; set; }
        }
    }
}