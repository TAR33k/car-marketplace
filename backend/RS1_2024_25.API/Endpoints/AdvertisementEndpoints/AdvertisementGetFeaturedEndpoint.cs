using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Data.Enums;
using RS1_2024_25.API.Helper.Api;
using static RS1_2024_25.API.Endpoints.AdvertisementEndpoints.AdvertisementGetFeaturedEndpoint;

namespace RS1_2024_25.API.Endpoints.AdvertisementEndpoints
{
    [Route("advertisements")]
    public class AdvertisementGetFeaturedEndpoint(ApplicationDbContext db) : MyEndpointBaseAsync
        .WithRequest<AdvertGetFeaturedRequest>
        .WithResult<AdvertGetFeaturedResponse[]>
    {
        [HttpGet("featured")]
        public override async Task<AdvertGetFeaturedResponse[]> HandleAsync(
            [FromQuery] AdvertGetFeaturedRequest request,
            CancellationToken cancellationToken = default)
        {
            var query = db.Advertisements
                .Include(a => a.Car)
                .Include(a => a.Status)
                .Include(a => a.User)
                .Include(a => a.Images)
                .Where(a => a.StatusID == 1); // Active advertisements only

            // Apply featured criteria based on request type
            query = request.FeaturedType switch
            {
                FeaturedType.MostViewed => query.OrderByDescending(a => a.ViewCount),
                FeaturedType.Newest => query.OrderByDescending(a => a.ListingDate),
                FeaturedType.PriceHighToLow => query.OrderByDescending(a => a.Price),
                FeaturedType.PriceLowToHigh => query.OrderBy(a => a.Price),
                _ => query.OrderByDescending(a => a.ListingDate)
            };

            var advertisements = await query
                .Take(request.Count)
                .Select(a => new AdvertGetFeaturedResponse
                {
                    ID = a.ID,
                    Title = a.Title,
                    Price = a.Price,
                    ListingDate = a.ListingDate,
                    ViewCount = a.ViewCount,
                    Condition = a.Condition,
                    CarName = a.Car.Name,
                    UserName = $"{a.User.FirstName} {a.User.LastName}",
                    PrimaryImageUrl = a.Images
                        .Where(i => i.IsPrimary)
                        .Select(i => i.ImageUrl)
                        .FirstOrDefault()
                })
                .ToArrayAsync(cancellationToken);

            return advertisements;
        }

        public class AdvertGetFeaturedRequest
        {
            public FeaturedType FeaturedType { get; set; } = FeaturedType.Newest;
            public int Count { get; set; } = 6; // Default number of featured items
        }

        public class AdvertGetFeaturedResponse
        {
            public int ID { get; set; }
            public string Title { get; set; }
            public decimal Price { get; set; }
            public DateTime ListingDate { get; set; }
            public int ViewCount { get; set; }
            public VehicleCondition Condition { get; set; }
            public string CarName { get; set; }
            public string UserName { get; set; }
            public string? PrimaryImageUrl { get; set; }
        }

        public enum FeaturedType
        {
            MostViewed,
            Newest,
            PriceHighToLow,
            PriceLowToHigh
        }
    }
}
