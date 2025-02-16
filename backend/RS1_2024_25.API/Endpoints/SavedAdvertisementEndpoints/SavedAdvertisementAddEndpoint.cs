using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Data.Models;
using RS1_2024_25.API.Data.Models.Ad.Advertisement;
using RS1_2024_25.API.Helper.Api;
using RS1_2024_25.API.Services;

namespace RS1_2024_25.API.Endpoints.SavedAdvertisementEndpoints
{
    [Route("saved-advertisements")]
    public class SavedAdvertisementAddEndpoint(
        ApplicationDbContext db,
        MyAuthService myAuthService) : MyEndpointBaseAsync
        .WithRequest<int>
        .WithActionResult
    {
        [HttpPost("{advertisementId}")]
        public override async Task<ActionResult> HandleAsync(
            [FromRoute] int advertisementId,
            CancellationToken cancellationToken = default)
        {
            var userId = myAuthService.GetAuthInfo().UserId;

            var exists = await db.SavedAdvertisements
                .AnyAsync(sa => sa.UserID == userId &&
                               sa.AdvertisementID == advertisementId,
                         cancellationToken);

            if (exists)
            {
                return BadRequest("Advertisement already saved");
            }

            var savedAd = new SavedAdvertisement
            {
                UserID = userId,
                AdvertisementID = advertisementId,
                SavedDate = DateTime.UtcNow
            };

            db.SavedAdvertisements.Add(savedAd);
            await db.SaveChangesAsync(cancellationToken);

            return Ok();
        }
    }
}