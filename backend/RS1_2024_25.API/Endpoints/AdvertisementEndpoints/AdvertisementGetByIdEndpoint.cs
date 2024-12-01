using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Data.Enums;
using RS1_2024_25.API.Helper.Api;
using static RS1_2024_25.API.Endpoints.AdvertisementEndpoints.AdvertisementGetByIdEndpoint;

namespace RS1_2024_25.API.Endpoints.AdvertisementEndpoints
{
    [Route("advertisements")]
    public class AdvertisementGetByIdEndpoint(ApplicationDbContext db) : MyEndpointBaseAsync
        .WithRequest<int>
        .WithResult<AdvertGetByIdResponse>
    {
        [HttpGet("{id}")]
        public override async Task<AdvertGetByIdResponse> HandleAsync(int id, CancellationToken cancellationToken = default)
        {
            var advertisement = await db.Advertisements
                .Include(a => a.Car)
                .Include(a => a.Status)
                .Include(a => a.User)
                .Include(a => a.Images)
                .Where(a => a.ID == id)
                .Select(a => new AdvertGetByIdResponse
                {
                    ID = a.ID,
                    Title = a.Title,
                    Description = a.Description,
                    Condition = a.Condition,
                    Price = a.Price,
                    ListingDate = a.ListingDate,
                    ExpirationDate = a.ExpirationDate,
                    ViewCount = a.ViewCount,
                    Status = a.Status.Name,
                    CarID = a.CarID,
                    CarName = a.Car.Name,
                    UserID = a.UserID,
                    UserName = $"{a.User.FirstName} {a.User.LastName}",
                    Images = a.Images.Select(i => new AdvertImageResponse
                    {
                        ID = i.ID,
                        Url = i.ImageUrl,
                        IsPrimary = i.IsPrimary
                    }).ToList()
                })
                .FirstOrDefaultAsync(cancellationToken);

            if (advertisement == null)
                throw new KeyNotFoundException("Advertisement not found");

            // Increment view count
            var entity = await db.Advertisements.FindAsync(new object[] { id }, cancellationToken);
            if (entity != null)
            {
                entity.ViewCount++;
                await db.SaveChangesAsync(cancellationToken);
            }

            return advertisement;
        }

        public class AdvertGetByIdResponse
        {
            public int ID { get; set; }
            public string Title { get; set; }
            public string Description { get; set; }
            public VehicleCondition Condition { get; set; }
            public decimal Price { get; set; }
            public DateTime ListingDate { get; set; }
            public DateTime? ExpirationDate { get; set; }
            public int ViewCount { get; set; }
            public string Status { get; set; }
            public int CarID { get; set; }
            public string CarName { get; set; }
            public int UserID { get; set; }
            public string UserName { get; set; }
            public List<AdvertImageResponse> Images { get; set; }
        }

        public class AdvertImageResponse
        {
            public int ID { get; set; }
            public string Url { get; set; }
            public bool IsPrimary { get; set; }
        }
    }
}
