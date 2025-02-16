using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Helper.Api;
using RS1_2024_25.API.Services;
using static RS1_2024_25.API.Endpoints.ProfileEndpoints.ProfileGetActivityEndpoint;

namespace RS1_2024_25.API.Endpoints.ProfileEndpoints
{
    [Route("profile")]
    public class ProfileGetActivityEndpoint(
    ApplicationDbContext db,
    MyAuthService myAuthService) : MyEndpointBaseAsync
    .WithRequest<int> 
    .WithResult<ActionResult<ProfileGetActivityResponse[]>>
    {
        [HttpGet("{userId}/activity")]
        public override async Task<ActionResult<ProfileGetActivityResponse[]>> HandleAsync(
            [FromRoute] int userId,
            CancellationToken cancellationToken = default)
        {
            MyAuthInfo authInfo = myAuthService.GetAuthInfo();
            if (authInfo.UserId != userId)
                return Unauthorized();

            var thirtyDaysAgo = DateTime.UtcNow.AddDays(-30);

            var activities = new List<ProfileGetActivityResponse>();

            var adActivities = await db.Advertisements
                .Where(a => a.UserID == userId && a.ListingDate >= thirtyDaysAgo)
                    .Select(a => new ProfileGetActivityResponse
                {
                    Type = "advertisement_created",
                    Description = $"Listed new advertisement: {a.Title}",
                    Date = a.ListingDate,
                    RelatedId = a.ID
                })
                .ToListAsync(cancellationToken);
            activities.AddRange(adActivities);

            // Get message activities
            var messageActivities = await db.ChatMessages
                .Where(m => m.ReceiverId == userId && m.Timestamp >= thirtyDaysAgo)
                .Select(m => new ProfileGetActivityResponse
                {
                    Type = "message_received",
                    Description = $"Received message from {m.Sender.Username}",
                    Date = m.Timestamp,
                    RelatedId = m.Id
                })
                .ToListAsync(cancellationToken);
            activities.AddRange(messageActivities);

            // Get advertisement question activities
            var questionActivities = await db.AdvertisementQuestions
                .Where(q => q.Advertisement.UserID == userId && q.CreatedAt >= thirtyDaysAgo)
                .Select(q => new ProfileGetActivityResponse
                {
                    Type = "question_received",
                    Description = $"Received question on: {q.Advertisement.Title}",
                    Date = q.CreatedAt,
                    RelatedId = q.ID
                })
                .ToListAsync(cancellationToken);
            activities.AddRange(questionActivities);

            // Get saved advertisement activities
            var savedActivities = await db.SavedAdvertisements
                .Where(s => s.UserID == userId && s.SavedDate >= thirtyDaysAgo)
                .Select(s => new ProfileGetActivityResponse
                {
                    Type = "advertisement_saved",
                    Description = $"Saved advertisement: {s.Advertisement.Title}",
                    Date = s.SavedDate,
                    RelatedId = s.AdvertisementID
                })
                .ToListAsync(cancellationToken);
            activities.AddRange(savedActivities);

            return activities
                .OrderByDescending(a => a.Date)
                .Take(20)
                .ToArray();
        }

        public class ProfileGetActivityResponse
        {
            public required string Type { get; set; }
            public required string Description { get; set; }
            public required DateTime Date { get; set; }
            public required int RelatedId { get; set; }
        }
    }
}