using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Helper.Api;
using RS1_2024_25.API.Services;
using static RS1_2024_25.API.Endpoints.CarImageEndpoints.CarImageSetPrimaryEndpoint;

namespace RS1_2024_25.API.Endpoints.CarImageEndpoints
{
    [MyAuthorization(isAdmin: true)]
    [Route("car-images")]
    public class CarImageSetPrimaryEndpoint(ApplicationDbContext db) : MyEndpointBaseAsync
        .WithRequest<CarImageSetPrimaryRequest>
        .WithoutResult
    {
        [HttpPut("set-primary")]
        public override async Task HandleAsync(
            CarImageSetPrimaryRequest request,
            CancellationToken cancellationToken = default)
        {
            var image = await db.CarImages
                .Include(i => i.Advertisement)
                .FirstOrDefaultAsync(i => i.ID == request.ImageId, cancellationToken);

            if (image == null)
                throw new KeyNotFoundException("Image not found");

            // Update all images for this advertisement
            var otherImages = await db.CarImages
                .Where(i => i.AdvertisementID == image.AdvertisementID)
                .ToListAsync(cancellationToken);

            foreach (var img in otherImages)
            {
                img.IsPrimary = (img.ID == request.ImageId);
            }

            await db.SaveChangesAsync(cancellationToken);
        }

        public class CarImageSetPrimaryRequest
        {
            public int ImageId { get; set; }
        }
    }
}
