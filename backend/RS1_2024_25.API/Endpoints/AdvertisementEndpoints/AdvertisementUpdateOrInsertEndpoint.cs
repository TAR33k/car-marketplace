using Microsoft.AspNetCore.Mvc;
using RS1_2024_25.API.Data.Models.Ad.Advertisement;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Helper.Api;
using RS1_2024_25.API.Services;
using static RS1_2024_25.API.Endpoints.AdvertisementEndpoints.AdvertisementUpdateOrInsertEndpoint;
using Microsoft.EntityFrameworkCore;
using System.ComponentModel.DataAnnotations;
using RS1_2024_25.API.Data.Enums;

namespace RS1_2024_25.API.Endpoints.AdvertisementEndpoints
{
    [Route("advertisements")]
    public class AdvertisementUpdateOrInsertEndpoint(
    ApplicationDbContext db,
    MyAuthService myAuthService) : MyEndpointBaseAsync
    .WithRequest<AdvertUpdateOrInsertRequest>
    .WithActionResult<AdvertUpdateOrInsertResponse>
    {
        [HttpPost]
        public override async Task<ActionResult<AdvertUpdateOrInsertResponse>> HandleAsync(
    [FromBody] AdvertUpdateOrInsertRequest request,
    CancellationToken cancellationToken = default)
        {
            MyAuthInfo authInfo = myAuthService.GetAuthInfo();
            if (!authInfo.IsLoggedIn)
                return Unauthorized();

            // Validate if Car exists
            var carExists = await db.Cars.AnyAsync(c => c.ID == request.CarID, cancellationToken);
            if (!carExists)
                return BadRequest("Invalid CarID");

            // Get active status by name
            var activeStatus = await db.StatusTypes
                .FirstOrDefaultAsync(s => s.Name == "Active", cancellationToken);
            if (activeStatus == null)
                return BadRequest("Active status type not found in the system");

            bool isInsert = (request.ID == null || request.ID == 0);
            Advertisement? advertisement;

            if (isInsert)
            {
                advertisement = new Advertisement
                {
                    UserID = authInfo.UserId,
                    ListingDate = DateTime.Now,
                    ViewCount = 0,
                    StatusID = activeStatus.ID  // Use the found status ID
                };
                db.Advertisements.Add(advertisement);
            }
            else
            {
                advertisement = await db.Advertisements
                    .FirstOrDefaultAsync(x => x.ID == request.ID, cancellationToken);

                if (advertisement == null)
                    throw new KeyNotFoundException("Advertisement not found");

                if (advertisement.UserID != authInfo.UserId && !authInfo.IsAdmin)
                    return Unauthorized();
            }

            advertisement.Title = request.Title;
            advertisement.Description = request.Description;
            advertisement.Condition = request.Condition;
            advertisement.Price = request.Price;
            advertisement.ExpirationDate = request.ExpirationDate;
            advertisement.CarID = request.CarID;

            try
            {
                await db.SaveChangesAsync(cancellationToken);
            }
            catch (DbUpdateException ex)
            {
                Console.WriteLine($"Error saving advertisement: {ex.Message}");
                Console.WriteLine($"Inner exception: {ex.InnerException?.Message}");
                return StatusCode(500, "Error saving advertisement. Please ensure all required data is valid.");
            }

            return new AdvertUpdateOrInsertResponse
            {
                ID = advertisement.ID,
                Title = advertisement.Title,
                Description = advertisement.Description,
                Condition = advertisement.Condition,
                Price = advertisement.Price,
                ListingDate = advertisement.ListingDate,
                ExpirationDate = advertisement.ExpirationDate,
                CarID = advertisement.CarID,
                StatusID = advertisement.StatusID
            };
        }

        public class AdvertUpdateOrInsertRequest
        {
            public int? ID { get; set; }
            [Required]
            [MaxLength(100)]
            public string Title { get; set; }
            [MaxLength(1000)]
            public string Description { get; set; }
            [Required]
            public VehicleCondition Condition { get; set; }
            [Required]
            [Range(0, double.MaxValue)]
            public decimal Price { get; set; }
            public DateTime? ExpirationDate { get; set; }
            [Required]
            public int CarID { get; set; }
        }

        public class AdvertUpdateOrInsertResponse
        {
            public int ID { get; set; }
            public string Title { get; set; }
            public string Description { get; set; }
            public VehicleCondition Condition { get; set; }
            public decimal Price { get; set; }
            public DateTime ListingDate { get; set; }
            public DateTime? ExpirationDate { get; set; }
            public int CarID { get; set; }
            public int StatusID { get; set; }
        }
    }
}