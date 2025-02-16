using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Helper.Api;
using RS1_2024_25.API.Services;
using static RS1_2024_25.API.Endpoints.AdvertisementEndpoints.AdvertisementUpdateStatusEndpoint;

namespace RS1_2024_25.API.Endpoints.AdvertisementEndpoints
{
    [Route("advertisements")]
    public class AdvertisementUpdateStatusEndpoint(
    ApplicationDbContext db,
    MyAuthService myAuthService) : MyEndpointBaseAsync
    .WithRequest<AdvertStatusUpdateRequest>
    .WithoutResult
    {
        [HttpPut("{id}/status")]
        public override async Task HandleAsync(AdvertStatusUpdateRequest request, CancellationToken cancellationToken = default)
        {
            var advertisement = await db.Advertisements
                .FirstOrDefaultAsync(x => x.ID == request.AdvertisementId, cancellationToken);

            if (advertisement == null)
                throw new KeyNotFoundException("Advertisement not found");

            var authInfo = myAuthService.GetAuthInfo();

            // Allow both owners and admins to update status
            if (advertisement.UserID != authInfo.UserId && !authInfo.IsAdmin)
                throw new UnauthorizedAccessException("Not authorized to update this advertisement");

            // Regular users can only change between Active, Sold, and back
            if (!authInfo.IsAdmin)
            {
                if (!(request.NewStatusId == 1 || request.NewStatusId == 2) || // Active or Sold
                    (advertisement.StatusID != 1 && advertisement.StatusID != 2 && advertisement.StatusID != 3)) // From Active, Sold or Expired
                {
                    throw new UnauthorizedAccessException("Not authorized to set this status");
                }
            }

            var statusExists = await db.StatusTypes
                .AnyAsync(s => s.ID == request.NewStatusId, cancellationToken);

            if (!statusExists)
                throw new KeyNotFoundException("Status not found");

            // If changing from Expired to Active, refresh expiration date
            if (advertisement.StatusID == 3 && request.NewStatusId == 1)
            {
                advertisement.ExpirationDate = DateTime.UtcNow.AddDays(30);
            }

            advertisement.StatusID = request.NewStatusId;
            await db.SaveChangesAsync(cancellationToken);
        }

        public class AdvertStatusUpdateRequest
        {
            public int AdvertisementId { get; set; }
            public int NewStatusId { get; set; }
        }
    }
}
