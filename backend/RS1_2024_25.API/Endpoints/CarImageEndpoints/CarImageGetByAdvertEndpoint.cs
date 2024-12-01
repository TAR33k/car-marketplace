using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Helper.Api;
using static RS1_2024_25.API.Endpoints.CarImageEndpoints.CarImageGetByAdvertEndpoint;

namespace RS1_2024_25.API.Endpoints.CarImageEndpoints
{
    [Route("car-images")]
    public class CarImageGetByAdvertEndpoint(ApplicationDbContext db) : MyEndpointBaseAsync
        .WithRequest<int>
        .WithResult<CarImageGetByAdvertResponse[]>
    {
        [HttpGet("by-advertisement/{id}")]
        public override async Task<CarImageGetByAdvertResponse[]> HandleAsync(
            int id,
            CancellationToken cancellationToken = default)
        {
            var images = await db.CarImages
                .Where(i => i.AdvertisementID == id)
                .Select(i => new CarImageGetByAdvertResponse
                {
                    ID = i.ID,
                    ImageUrl = i.ImageUrl,
                    IsPrimary = i.IsPrimary,
                    UploadedDate = i.UploadedDate,
                    AdvertisementID = i.AdvertisementID
                })
                .ToArrayAsync(cancellationToken);

            return images;
        }

        public class CarImageGetByAdvertResponse
        {
            public int ID { get; set; }
            public string ImageUrl { get; set; }
            public bool IsPrimary { get; set; }
            public DateTime UploadedDate { get; set; }
            public int AdvertisementID { get; set; }
        }
    }
}
