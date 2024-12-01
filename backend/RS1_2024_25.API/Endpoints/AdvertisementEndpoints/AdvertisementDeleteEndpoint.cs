using Microsoft.AspNetCore.Mvc;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Helper.Api;
using RS1_2024_25.API.Services.Interfaces;
using RS1_2024_25.API.Services;
using Microsoft.EntityFrameworkCore;

namespace RS1_2024_25.API.Endpoints.AdvertisementEndpoints
{
    [MyAuthorization(isAdmin: true)]
    [Route("advertisements")]
    public class AdvertisementDeleteEndpoint(
        ApplicationDbContext db,
        MyAuthService myAuthService,
        IImageStorage imageStorage) : MyEndpointBaseAsync
        .WithRequest<int>
        .WithoutResult
    {
        [HttpDelete("{id}")]
        public override async Task HandleAsync(int id, CancellationToken cancellationToken = default)
        {
            var advertisement = await db.Advertisements
                .Include(a => a.Images)
                .SingleOrDefaultAsync(x => x.ID == id, cancellationToken);

            if (advertisement == null)
                throw new KeyNotFoundException("Advertisement not found");

            var authInfo = myAuthService.GetAuthInfo();
            if (advertisement.UserID != authInfo.UserId && !authInfo.IsAdmin)
                throw new UnauthorizedAccessException("Not authorized to delete this advertisement");

            // Delete associated images first
            if (advertisement.Images != null)
            {
                foreach (var image in advertisement.Images)
                {
                    await imageStorage.DeleteAsync(image.ImageUrl);
                }
            }

            db.Advertisements.Remove(advertisement);
            await db.SaveChangesAsync(cancellationToken);
        }
    }
}
