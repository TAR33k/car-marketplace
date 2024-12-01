using Microsoft.AspNetCore.Mvc;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Helper.Api;
using RS1_2024_25.API.Services.Interfaces;
using RS1_2024_25.API.Services;
using Microsoft.EntityFrameworkCore;

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

            // Delete physical file
            await imageStorage.DeleteAsync(image.ImageUrl);

            // Remove database record
            db.CarImages.Remove(image);
            await db.SaveChangesAsync(cancellationToken);
        }
    }
}
