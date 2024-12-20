using Microsoft.AspNetCore.Mvc;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Helper.Api;
using RS1_2024_25.API.Services.Interfaces;
using RS1_2024_25.API.Services;
using Microsoft.EntityFrameworkCore;
using System.IO;

namespace RS1_2024_25.API.Endpoints.CarImageEndpoints
{
    [MyAuthorization(isAdmin: true)]
    [Route("car-images")]
    public class CarImageDeleteEndpoint(
        ApplicationDbContext db,
        IImageStorage imageStorage) : MyEndpointBaseAsync
        .WithRequest<int>
        .WithoutResult
    {
        [HttpDelete("{id}")]
        public override async Task HandleAsync(int id, CancellationToken cancellationToken = default)
        {
            var image = await db.CarImages
                .Include(i => i.Advertisement)
                .SingleOrDefaultAsync(x => x.ID == id, cancellationToken);

            if (image == null)
                throw new KeyNotFoundException("Image not found");

            var wasPrimary = image.IsPrimary;
            var advertisementId = image.AdvertisementID;

            // Delete physical file
            await imageStorage.DeleteAsync(image.ImageUrl);

            // Remove database record
            db.CarImages.Remove(image);

            // If this was the primary image, set a new primary
            if (wasPrimary)
            {
                var remainingImages = await db.CarImages
                    .Where(i => i.AdvertisementID == advertisementId)
                    .OrderBy(i => i.ID)
                    .ToListAsync(cancellationToken);

                if (remainingImages.Any())
                {
                    var newPrimaryImage = remainingImages.First();
                    newPrimaryImage.IsPrimary = true;
                }
            }
            // If there's no primary image after deletion, set the first one as primary
            else
            {
                var remainingImages = await db.CarImages
                    .Where(i => i.AdvertisementID == advertisementId)
                    .OrderBy(i => i.ID)
                    .ToListAsync(cancellationToken);

                if (remainingImages.Any() && !remainingImages.Any(img => img.IsPrimary))
                {
                    remainingImages.First().IsPrimary = true;
                }
            }

            await db.SaveChangesAsync(cancellationToken);
        }
    }
}
