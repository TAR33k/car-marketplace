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
    [Route("advertisements")]
    public class AdvertisementGetByUserEndpoint : MyEndpointBaseAsync
    .WithRequest<AdvertisementGetByUserEndpoint.AdvertGetByUserRequest>
    .WithResult<MyPagedList<AdvertisementGetByUserEndpoint.AdvertGetByUserResponse>>
    {
        private readonly ApplicationDbContext _db;
        private readonly MyAuthService _myAuthService;

        public AdvertisementGetByUserEndpoint(ApplicationDbContext db, MyAuthService myAuthService)
        {
            _db = db;
            _myAuthService = myAuthService;
        }

        [HttpGet("user/{userID}")]
        public override async Task<MyPagedList<AdvertGetByUserResponse>> HandleAsync(
            [FromQuery] AdvertGetByUserRequest request,
            CancellationToken cancellationToken = default)
        {
            var authInfo = _myAuthService.GetAuthInfo();
            var isOwnProfile = authInfo?.UserId == request.UserID;

            var query = _db.Advertisements
                .Include(a => a.Car)
                .Include(a => a.Status)
                .Include(a => a.Images)
                .Where(a => a.UserID == request.UserID);

            // If not viewing own profile, only show active and sold listings
            if (!isOwnProfile)
            {
                if (request.StatusID == 1)
                    query = query.Where(a => a.StatusID == 1);
                if (request.StatusID == 2)
                    query = query.Where(a => a.StatusID == 2);
            }
            // If viewing own profile and status filter is provided
            else if (request.StatusID.HasValue)
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
            [FromRoute]
            public int UserID { get; set; }
            public int? StatusID { get; set; }
        }

        public class AdvertGetByUserResponse
        {
            public int ID { get; set; }
            public required string Title { get; set; }
            public VehicleCondition Condition { get; set; }
            public decimal Price { get; set; }
            public DateTime ListingDate { get; set; }
            public DateTime? ExpirationDate { get; set; }
            public int ViewCount { get; set; }
            public required string Status { get; set; }
            public required string CarName { get; set; }
            public string? PrimaryImageUrl { get; set; }
        }
    }
}
