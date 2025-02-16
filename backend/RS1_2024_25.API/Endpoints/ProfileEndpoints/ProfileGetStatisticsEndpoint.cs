using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Helper.Api;
using RS1_2024_25.API.Services;
using static RS1_2024_25.API.Endpoints.ProfileEndpoints.ProfileGetStatisticsEndpoint;

namespace RS1_2024_25.API.Endpoints.ProfileEndpoints
{
    [Route("profile")]
    public class ProfileGetStatisticsEndpoint(
    ApplicationDbContext db,
    MyAuthService myAuthService) : MyEndpointBaseAsync
    .WithRequest<int>
    .WithResult<ActionResult<ProfileGetStatisticsResponse>>
    {
        [HttpGet("{userId}/statistics")]
        public override async Task<ActionResult<ProfileGetStatisticsResponse>> HandleAsync(
            [FromRoute] int userId,  // Changed to use userId directly
            CancellationToken cancellationToken = default)
        {
            MyAuthInfo authInfo = myAuthService.GetAuthInfo();
            if (authInfo.UserId != userId)
                return Unauthorized();

            var currentDate = DateTime.UtcNow;
            var thirtyDaysAgo = currentDate.AddDays(-30);

            var basicStats = await db.Advertisements
                .Where(a => a.UserID == userId)
                    .GroupBy(a => 1)
                .Select(g => new
                {
                    TotalAds = g.Count(),
                    ActiveAds = g.Count(a => a.StatusID == 1),
                    TotalViews = g.Sum(a => a.ViewCount),
                    SoldAds = g.Count(a => a.StatusID == 2)
                })
                .FirstOrDefaultAsync(cancellationToken);

            var adPerformance = await db.Advertisements
            .Where(a => a.UserID == userId)
            .OrderByDescending(a => a.ViewCount)
            .Take(5)
            .Select(a => new
            {
                a.Title,
                a.ViewCount,
                a.Status.Name,
                SaveCount = db.SavedAdvertisements.Count(sa => sa.AdvertisementID == a.ID)
            })
            .Select(a => new AdvertPerformance
            {
                Title = a.Title,
                Views = a.ViewCount,
                SaveCount = a.SaveCount,
                Status = a.Name
            })
            .ToListAsync(cancellationToken);

            return new ProfileGetStatisticsResponse
            {
                TotalAdvertisements = basicStats?.TotalAds ?? 0,
                ActiveAdvertisements = basicStats?.ActiveAds ?? 0,
                TotalViews = basicStats?.TotalViews ?? 0,
                TotalSold = basicStats?.SoldAds ?? 0,
                TopPerformingAds = adPerformance
            };
        }

        public class ProfileGetStatisticsResponse
        {
            public required int TotalAdvertisements { get; set; }
            public required int ActiveAdvertisements { get; set; }
            public required int TotalViews { get; set; }
            public required int TotalSold { get; set; }
            public required List<AdvertPerformance> TopPerformingAds { get; set; }
        }

        public class AdvertPerformance
        {
            public required string Title { get; set; }
            public required int Views { get; set; }
            public required int SaveCount { get; set; }
            public required string Status { get; set; }
        }
    }
}