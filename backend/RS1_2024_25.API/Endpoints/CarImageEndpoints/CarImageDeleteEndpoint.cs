using Microsoft.AspNetCore.Mvc;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Helper.Api;
using RS1_2024_25.API.Services.Interfaces;
using RS1_2024_25.API.Services;
using Microsoft.EntityFrameworkCore;
using System.IO;

namespace RS1_2024_25.API.Endpoints.CarImageEndpoints
{
    [Route("car-images")]
    public class CarImageDeleteEndpoint(
    ApplicationDbContext db,
    IImageStorage imageStorage,
    MyAuthService myAuthService) : MyEndpointBaseAsync
    .WithRequest<int>
    .WithActionResult
    {
        [HttpDelete("{id}")]
        public override async Task<ActionResult> HandleAsync(int id, CancellationToken cancellationToken = default)
        {
            var image = await db.CarImages
                .Include(i => i.Advertisement)
                .SingleOrDefaultAsync(x => x.ID == id, cancellationToken);

            if (image == null)
                return NotFound("Image not found");

            var authInfo = myAuthService.GetAuthInfo();
            if (image.Advertisement.UserID != authInfo.UserId && !authInfo.IsAdmin)
                return Unauthorized();

            var advertisementId = image.AdvertisementID;

            // Get all images for this advertisement (excluding the one being deleted)
            var remainingImages = await db.CarImages
                .Where(i => i.AdvertisementID == advertisementId && i.ID != id)
                .OrderBy(i => i.ID)
                .ToListAsync(cancellationToken);

            // If we're deleting the primary image and there are remaining images
            if (image.IsPrimary && remainingImages.Any())
            {
                // Set the first remaining image as primary
                var newPrimaryImage = remainingImages.First();
                newPrimaryImage.IsPrimary = true;
            }
            // If we're deleting a non-primary image and there are no primary images in remaining images
            else if (!image.IsPrimary && !remainingImages.Any(img => img.IsPrimary) && remainingImages.Any())
            {
                // Set the first remaining image as primary
                remainingImages.First().IsPrimary = true;
            }

            // Delete physical file
            await imageStorage.DeleteAsync(image.ImageUrl);

            // Remove database record
            db.CarImages.Remove(image);
            await db.SaveChangesAsync(cancellationToken);

            return Ok();
        }
    }
}
