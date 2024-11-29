using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Data.Models;
using RS1_2024_25.API.Helper.Api;
using RS1_2024_25.API.Services;
using System.Threading;
using System.Threading.Tasks;

namespace RS1_2024_25.API.Endpoints.CarEndpoints;

[Route("cars")]
public class CarDeleteEndpoint(ApplicationDbContext db) : MyEndpointBaseAsync
    .WithRequest<int>
    .WithoutResult
{
    [HttpDelete("{id}")]
    public override async Task HandleAsync(int id, CancellationToken cancellationToken = default)
    {
        var car = await db.Cars.SingleOrDefaultAsync(x => x.ID == id, cancellationToken);

        if (car == null)
            throw new KeyNotFoundException("Car not found");

        db.Cars.Remove(car);
        await db.SaveChangesAsync(cancellationToken);
    }
}

