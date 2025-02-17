using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Helper.Api;
using RS1_2024_25.API.Services;
using static RS1_2024_25.API.Endpoints.CarImageEndpoints.CarImageSetPrimaryEndpoint;

namespace RS1_2024_25.API.Endpoints.CarImageEndpoints
{
    [Route("car-images")]
    public class CarImageSetPrimaryEndpoint(
    ApplicationDbContext db,
    MyAuthService myAuthService) : MyEndpointBaseAsync
    .WithRequest<CarImageSetPrimaryRequest>
    .WithActionResult
    {
        [HttpPut("set-primary")]
        public override async Task<ActionResult> HandleAsync(
            CarImageSetPrimaryRequest request,
            CancellationToken cancellationToken = default)
        {
            var image = await db.CarImages
                .Include(i => i.Advertisement)
                .FirstOrDefaultAsync(i => i.ID == request.ImageId, cancellationToken);

            if (image == null)
                return NotFound("Image not found");

            var authInfo = myAuthService.GetAuthInfo();
            if (image.Advertisement.UserID != authInfo.UserId && !authInfo.IsAdmin)
                return Unauthorized();

            // Update all images for this advertisement
            var otherImages = await db.CarImages
                .Where(i => i.AdvertisementID == image.AdvertisementID)
                .ToListAsync(cancellationToken);

            foreach (var img in otherImages)
            {
                img.IsPrimary = (img.ID == request.ImageId);
            }

            await db.SaveChangesAsync(cancellationToken);

            return Ok();
        }

        public class CarImageSetPrimaryRequest
        {
            public int ImageId { get; set; }
        }
    }
}
