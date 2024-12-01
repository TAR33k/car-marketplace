using Microsoft.AspNetCore.Mvc;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Helper.Api;
using RS1_2024_25.API.Helper;
using RS1_2024_25.API.Services;
using static RS1_2024_25.API.Endpoints.AdvertisementEndpoints.AdvertisementGetByUserEndpoint;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data.Enums;

namespace RS1_2024_25.API.Endpoints.AdvertisementEndpoints
{
    [MyAuthorization(isAdmin: true)]
    [Route("advertisements")]
    public class AdvertisementGetByUserEndpoint(
        ApplicationDbContext db,
        MyAuthService myAuthService) : MyEndpointBaseAsync
        .WithRequest<AdvertGetByUserRequest>
        .WithResult<MyPagedList<AdvertGetByUserResponse>>
    {
        [HttpGet("my")]
        public override async Task<MyPagedList<AdvertGetByUserResponse>> HandleAsync(
            [FromQuery] AdvertGetByUserRequest request,
            CancellationToken cancellationToken = default)
        {
            var authInfo = myAuthService.GetAuthInfo();

            var query = db.Advertisements
                .Include(a => a.Car)
                .Include(a => a.Status)
                .Include(a => a.Images)
                .Where(a => a.UserID == authInfo.UserId);

            if (request.StatusID.HasValue)
            {
                query = query.Where(a => a.StatusID == request.StatusID.Value);
            }

            var projectedQuery = query.Select(a => new AdvertGetByUserResponse
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
                PrimaryImageUrl = a.Images
                    .Where(i => i.IsPrimary)
                    .Select(i => i.ImageUrl)
                    .FirstOrDefault()
            });

            return await MyPagedList<AdvertGetByUserResponse>.CreateAsync(
                projectedQuery, request, cancellationToken);
        }

        public class AdvertGetByUserRequest : MyPagedRequest
        {
            public int? StatusID { get; set; }
        }

        public class AdvertGetByUserResponse
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
            public string? PrimaryImageUrl { get; set; }
        }
    }
}
