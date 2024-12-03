using Microsoft.AspNetCore.Mvc;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Data.Models;
using RS1_2024_25.API.Helper.Api;
using RS1_2024_25.API.Services;
using RS1_2024_25.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;
using static RS1_2024_25.API.Endpoints.CarImageEndpoints.CarImageBulkUploadEndpoint;

namespace RS1_2024_25.API.Endpoints.CarImageEndpoints
{
    [MyAuthorization(isAdmin: true)]
    [Route("car-images")]
    public class CarImageBulkUploadEndpoint(
        ApplicationDbContext db,
        IImageValidator imageValidator,
        IImageProcessor imageProcessor,
        IImageStorage imageStorage,
        MyAuthService myAuthService) : MyEndpointBaseAsync
        .WithRequest<BulkUploadRequest>
        .WithActionResult<BulkUploadResponse>
    {
        [HttpPost("bulk")]
        public override async Task<ActionResult<BulkUploadResponse>> HandleAsync(
            [FromForm] BulkUploadRequest request,
            CancellationToken cancellationToken = default)
        {
            if (request.Images == null || !request.Images.Any())
                return BadRequest("No images provided");

            if (request.Images.Length > 10) // Limit number of images
                return BadRequest("Maximum 10 images allowed per upload");

            var advertisement = await db.Advertisements
                .FirstOrDefaultAsync(a => a.ID == request.AdvertisementID, cancellationToken);

            if (advertisement == null)
                return NotFound("Advertisement not found");

            var authInfo = myAuthService.GetAuthInfo();
            if (advertisement.UserID != authInfo.UserId && !authInfo.IsAdmin)
                return Unauthorized();

            var uploadedImages = new List<CarImageResponse>();
            var errors = new List<string>();

            foreach (var image in request.Images)
            {
                try
                {
                    await imageValidator.ValidateAsync(image);
                    var processedImage = await imageProcessor.ProcessImageAsync(image);
                    var imageResult = await imageStorage.SaveAsync(processedImage, image.FileName);

                    var carImage = new CarImage
                    {
                        ImageUrl = imageResult.Url,
                        IsPrimary = false,
                        UploadedDate = DateTime.UtcNow,
                        AdvertisementID = request.AdvertisementID
                    };

                    db.CarImages.Add(carImage);
                    await db.SaveChangesAsync(cancellationToken);

                    uploadedImages.Add(new CarImageResponse
                    {
                        ID = carImage.ID,
                        ImageUrl = carImage.ImageUrl,
                        IsPrimary = carImage.IsPrimary,
                        UploadedDate = carImage.UploadedDate
                    });
                }
                catch (Exception ex)
                {
                    errors.Add($"Failed to upload {image.FileName}: {ex.Message}");
                }
            }

            return new BulkUploadResponse
            {
                UploadedImages = uploadedImages,
                Errors = errors
            };
        }

        public class BulkUploadRequest
        {
            public required int AdvertisementID { get; set; }
            public required IFormFile[] Images { get; set; }
        }

        public class BulkUploadResponse
        {
            public List<CarImageResponse> UploadedImages { get; set; } = new();
            public List<string> Errors { get; set; } = new();
        }

        public class CarImageResponse
        {
            public int ID { get; set; }
            public string ImageUrl { get; set; }
            public bool IsPrimary { get; set; }
            public DateTime UploadedDate { get; set; }
        }
    }
}