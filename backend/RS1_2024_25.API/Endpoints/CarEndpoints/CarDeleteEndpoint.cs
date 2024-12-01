using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Helper.Api;
using RS1_2024_25.API.Services;

namespace RS1_2024_25.API.Endpoints.CarEndpoints
{
    [Route("cars")]
    public class CarDeleteEndpoint(
        ApplicationDbContext db,
        MyAuthService myAuthService) : MyEndpointBaseAsync
        .WithRequest<int>
        .WithActionResult
    {
        [HttpDelete("{id}")]
        public override async Task<ActionResult> HandleAsync(
            int id,
            CancellationToken cancellationToken = default)
        {
            MyAuthInfo authInfo = myAuthService.GetAuthInfo();
            if (!authInfo.IsLoggedIn)
                return Unauthorized();

            var car = await db.Cars
                .Include(c => c.Advertisement)
                .FirstOrDefaultAsync(c => c.ID == id, cancellationToken);

            if (car == null)
                return NotFound();

            // Check if user owns the advertisement or is admin
            if (car.Advertisement != null &&
                car.Advertisement.UserID != authInfo.UserId &&
                !authInfo.IsAdmin)
            {
                return Unauthorized();
            }

            db.Cars.Remove(car);
            await db.SaveChangesAsync(cancellationToken);

            return Ok();
        }
    }
}