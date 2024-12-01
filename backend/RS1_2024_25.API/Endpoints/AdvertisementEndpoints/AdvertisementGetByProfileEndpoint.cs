using Microsoft.AspNetCore.Mvc;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Helper.Api;
using RS1_2024_25.API.Helper;
using static RS1_2024_25.API.Endpoints.AdvertisementEndpoints.AdvertisementGetByProfileEndpoint;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data.Enums;

namespace RS1_2024_25.API.Endpoints.AdvertisementEndpoints
{
    [Route("advertisements")]
    public class AdvertisementGetByProfileEndpoint(ApplicationDbContext db) : MyEndpointBaseAsync
        .WithRequest<AdvertGetByProfileRequest>
        .WithResult<MyPagedList<AdvertGetByProfileResponse>>
    {
        [HttpGet("user/{userId}")]
        public override async Task<MyPagedList<AdvertGetByProfileResponse>> HandleAsync(
            [FromQuery] AdvertGetByProfileRequest request,
            CancellationToken cancellationToken = default)
        {
            var userExists = await db.Users.AnyAsync(u => u.ID == request.UserId, cancellationToken);
            if (!userExists)
                throw new KeyNotFoundException("User not found");

            var query = db.Advertisements
                .Include(a => a.Car)
                .Include(a => a.Status)
                .Include(a => a.Images)
                .Where(a => a.UserID == request.UserId && a.StatusID == 1); // Only active listings

            query = request.SortBy switch
            {
                AdvertSortType.Newest => query.OrderByDescending(a => a.ListingDate),
                AdvertSortType.Oldest => query.OrderBy(a => a.ListingDate),
                AdvertSortType.PriceHighToLow => query.OrderByDescending(a => a.Price),
                AdvertSortType.PriceLowToHigh => query.OrderBy(a => a.Price),
                _ => query.OrderByDescending(a => a.ListingDate)
            };

            var projectedQuery = query.Select(a => new AdvertGetByProfileResponse
            {
                ID = a.ID,
                Title = a.Title,
                Condition = a.Condition,
                Price = a.Price,
                ListingDate = a.ListingDate,
                ViewCount = a.ViewCount,
                CarName = a.Car.Name,
                Status = a.Status.Name,
                PrimaryImageUrl = a.Images
                    .Where(i => i.IsPrimary)
                    .Select(i => i.ImageUrl)
                    .FirstOrDefault()
            });

            return await MyPagedList<AdvertGetByProfileResponse>.CreateAsync(
                projectedQuery, request, cancellationToken);
        }

        public class AdvertGetByProfileRequest : MyPagedRequest
        {
            public required int UserId { get; set; }
            public AdvertSortType SortBy { get; set; } = AdvertSortType.Newest;
        }

        public class AdvertGetByProfileResponse
        {
            public int ID { get; set; }
            public string Title { get; set; }
            public VehicleCondition Condition { get; set; }
            public decimal Price { get; set; }
            public DateTime ListingDate { get; set; }
            public int ViewCount { get; set; }
            public string CarName { get; set; }
            public string Status { get; set; }
            public string? PrimaryImageUrl { get; set; }
        }

        public enum AdvertSortType
        {
            Newest,
            Oldest,
            PriceHighToLow,
            PriceLowToHigh
        }
    }
}
