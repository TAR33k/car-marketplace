using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Helper.Api;
using RS1_2024_25.API.Services;

namespace RS1_2024_25.API.Endpoints.SavedAdvertisementEndpoints
{
    [Route("saved-advertisements")]
    public class SavedAdvertisementCheckEndpoint(
        ApplicationDbContext db,
        MyAuthService myAuthService) : MyEndpointBaseAsync
        .WithRequest<int>
        .WithResult<bool>
    {
        [HttpGet("check/{advertisementId}")]
        public override async Task<bool> HandleAsync(
            [FromRoute] int advertisementId,
            CancellationToken cancellationToken = default)
        {
            var userId = myAuthService.GetAuthInfo().UserId;

            return await db.SavedAdvertisements
                .AnyAsync(sa => sa.UserID == userId &&
                               sa.AdvertisementID == advertisementId,
                         cancellationToken);
        }
    }
}