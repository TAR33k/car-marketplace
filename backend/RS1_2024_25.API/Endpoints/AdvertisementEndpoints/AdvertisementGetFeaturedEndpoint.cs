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
        private static int? _cachedActiveStatusId;
        private const string ImageDirectory = "uploads/images";

        [HttpGet("featured")]
        public override async Task<AdvertGetFeaturedResponse[]> HandleAsync(
    [FromQuery] AdvertGetFeaturedRequest request,
    CancellationToken cancellationToken = default)
        {
            try
            {
                // Get or cache the Active status ID
                if (!_cachedActiveStatusId.HasValue)
                {
                    _cachedActiveStatusId = await db.StatusTypes
                        .Where(s => s.Name == "Active")
                        .Select(s => s.ID)
                        .FirstOrDefaultAsync(cancellationToken);

                    if (_cachedActiveStatusId == 0)
                    {
                        throw new InvalidOperationException("Active status not found in database");
                    }
                }

                var query = db.Advertisements
            .Include(a => a.Car)
            .Include(a => a.Status)
            .Include(a => a.User)
            .Include(a => a.Images)
            .Where(a => a.StatusID == _cachedActiveStatusId);

                // Apply ordering
                query = request.FeaturedType switch
                {
                    FeaturedType.MostViewed => query.OrderByDescending(a => a.ViewCount),
                    FeaturedType.Newest => query.OrderByDescending(a => a.ListingDate),
                    FeaturedType.PriceHighToLow => query.OrderByDescending(a => a.Price),
                    FeaturedType.PriceLowToHigh => query.OrderBy(a => a.Price),
                    _ => query.OrderByDescending(a => a.ListingDate)
                };

                // Get total count for pagination
                var totalCount = await query.CountAsync(cancellationToken);

                // Apply pagination
                var pageSize = request.Count;
                var skip = (request.Page - 1) * pageSize;

                // Check if there are more pages
                var hasMore = totalCount > skip + pageSize;

                var advertisements = await query
                    .Skip(skip)
                    .Take(pageSize)
                    .Select(a => new AdvertGetFeaturedResponse
                    {
                        ID = a.ID,
                        Title = a.Title,
                        Price = a.Price,
                        ListingDate = a.ListingDate,
                        ViewCount = a.ViewCount,
                        Condition = a.Condition,
                        CarName = a.Car.Name ?? "Unknown",
                        UserName = $"{a.User.FirstName} {a.User.LastName}",
                        PrimaryImageUrl = a.Images
                            .Where(i => i.IsPrimary)
                            .Select(i => i.ImageUrl)
                            .FirstOrDefault()
                    })
                    .ToArrayAsync(cancellationToken);

                // Return empty array if no results
                if (!advertisements.Any())
                {
                    return Array.Empty<AdvertGetFeaturedResponse>();
                }

                return advertisements;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error in HandleAsync: {ex.Message}");
                throw;
            }
        }


        public class AdvertGetFeaturedRequest
        {
            public FeaturedType FeaturedType { get; set; } = FeaturedType.Newest;
            public int Count { get; set; } = 6;
            public int Page { get; set; } = 1;
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
            MostViewed = 0,
            Newest = 1,
            PriceHighToLow = 2,
            PriceLowToHigh = 3
        }
    }
}
