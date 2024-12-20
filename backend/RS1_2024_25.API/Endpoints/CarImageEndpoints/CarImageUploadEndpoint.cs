using Microsoft.AspNetCore.Mvc;
using RS1_2024_25.API.Data.Models;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Helper.Api;
using RS1_2024_25.API.Services.Interfaces;
using static RS1_2024_25.API.Endpoints.CarImageEndpoints.CarImageUploadEndpoint;
using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Services;
using System.IdentityModel;


namespace RS1_2024_25.API.Endpoints.CarImageEndpoints
{
    [MyAuthorization(isAdmin: true)]
    [Route("car-images")]
    public class CarImageUploadEndpoint(
        ApplicationDbContext db,
        IImageValidator imageValidator,
        IImageProcessor imageProcessor,
        IImageStorage imageStorage,
        IWebHostEnvironment webHostEnvironment) : MyEndpointBaseAsync
        .WithRequest<CarImageUploadRequest>
        .WithResult<CarImageUploadResponse>
    {
        [HttpPost("upload")]
        public override async Task<CarImageUploadResponse> HandleAsync(
            [FromForm] CarImageUploadRequest request,
            CancellationToken cancellationToken = default)
        {
            try
            {
                var advertisement = await db.Advertisements
                    .FirstOrDefaultAsync(a => a.ID == request.AdvertisementID, cancellationToken);

                if (advertisement == null)
                    throw new KeyNotFoundException("Advertisement not found");

                await imageValidator.ValidateAsync(request.Image);
                var processedImage = await imageProcessor.ProcessImageAsync(request.Image);
                var imageResult = await imageStorage.SaveAsync(processedImage, request.Image.FileName);

                // Check if this is the first image for this advertisement
                var isFirstImage = !await db.CarImages
                    .AnyAsync(i => i.AdvertisementID == request.AdvertisementID, cancellationToken);

                // First image should always be primary
                if (isFirstImage)
                {
                    request.IsPrimary = true;
                }

                // If setting as primary, ensure no other images are primary
                if (request.IsPrimary)
                {
                    await db.CarImages
                        .Where(i => i.AdvertisementID == request.AdvertisementID)
                        .ExecuteUpdateAsync(s => s
                            .SetProperty(b => b.IsPrimary, false), cancellationToken);
                }

                var carImage = new CarImage
                {
                    ImageUrl = imageResult.Url,
                    AdvertisementID = request.AdvertisementID,
                    IsPrimary = request.IsPrimary,
                    UploadedDate = DateTime.Now
                };

                db.CarImages.Add(carImage);
                await db.SaveChangesAsync(cancellationToken);

                return new CarImageUploadResponse
                {
                    ID = carImage.ID,
                    ImageUrl = carImage.ImageUrl,
                    IsPrimary = carImage.IsPrimary,
                    UploadedDate = carImage.UploadedDate,
                    AdvertisementID = carImage.AdvertisementID
                };
            }
            catch (Exception ex) when (ex is ValidationException || ex is ArgumentException)
            {
                throw new Exception(ex.Message);
            }
        }

        public class CarImageUploadRequest
        {
            [Required]
            public IFormFile Image { get; set; }

            [Required]
            public int AdvertisementID { get; set; }

            public bool IsPrimary { get; set; }
        }

        public class CarImageUploadResponse
        {
            public int ID { get; set; }
            public string ImageUrl { get; set; }
            public bool IsPrimary { get; set; }
            public DateTime UploadedDate { get; set; }
            public int AdvertisementID { get; set; }
        }
    }
}
