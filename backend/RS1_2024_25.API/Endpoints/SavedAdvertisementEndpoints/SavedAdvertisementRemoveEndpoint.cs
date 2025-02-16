using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Helper.Api;
using RS1_2024_25.API.Services;

namespace RS1_2024_25.API.Endpoints.SavedAdvertisementEndpoints
{
    [Route("saved-advertisements")]
    public class SavedAdvertisementRemoveEndpoint(
        ApplicationDbContext db,
        MyAuthService myAuthService) : MyEndpointBaseAsync
        .WithRequest<int>
        .WithActionResult
    {
        [HttpDelete("{advertisementId}")]
        public override async Task<ActionResult> HandleAsync(
            [FromRoute] int advertisementId,
            CancellationToken cancellationToken = default)
        {
            var userId = myAuthService.GetAuthInfo().UserId;

            var savedAd = await db.SavedAdvertisements
                .FirstOrDefaultAsync(sa =>
                    sa.UserID == userId &&
                    sa.AdvertisementID == advertisementId,
                    cancellationToken);

            if (savedAd == null)
            {
                return NotFound();
            }

            db.SavedAdvertisements.Remove(savedAd);
            await db.SaveChangesAsync(cancellationToken);

            return Ok();
        }
    }
}