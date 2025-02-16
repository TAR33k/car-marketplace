using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Helper.Api;
using RS1_2024_25.API.Services;
using static RS1_2024_25.API.Endpoints.SavedAdvertisementEndpoints.SavedAdvertisementGetAllEndpoint;

namespace RS1_2024_25.API.Endpoints.SavedAdvertisementEndpoints
{
    [Route("saved-advertisements")]
    public class SavedAdvertisementGetAllEndpoint(
        ApplicationDbContext db,
        MyAuthService myAuthService) : MyEndpointBaseAsync
        .WithoutRequest
        .WithResult<SavedAdvertisementGetAllResponse[]>
    {
        [HttpGet]
        public override async Task<SavedAdvertisementGetAllResponse[]> HandleAsync(
            CancellationToken cancellationToken = default)
        {
            var userId = myAuthService.GetAuthInfo().UserId;

            var result = await db.SavedAdvertisements
                .Include(sa => sa.Advertisement)
                    .ThenInclude(a => a.Car)
                .Include(sa => sa.Advertisement)
                    .ThenInclude(a => a.Images)
                .Where(sa => sa.UserID == userId)
                .Select(sa => new SavedAdvertisementGetAllResponse
                {
                    ID = sa.ID,
                    AdvertisementID = sa.AdvertisementID,
                    Title = sa.Advertisement.Title,
                    Price = sa.Advertisement.Price,
                    CarName = sa.Advertisement.Car.Name,
                    PrimaryImageUrl = sa.Advertisement.Images
                        .Where(i => i.IsPrimary)
                        .Select(i => i.ImageUrl)
                        .FirstOrDefault(),
                    SavedDate = sa.SavedDate
                })
                .ToArrayAsync(cancellationToken);

            return result;
        }

        public class SavedAdvertisementGetAllResponse
        {
            public required int ID { get; set; }
            public required int AdvertisementID { get; set; }
            public required string Title { get; set; }
            public required decimal Price { get; set; }
            public required string CarName { get; set; }
            public string? PrimaryImageUrl { get; set; }
            public required DateTime SavedDate { get; set; }
        }
    }
}