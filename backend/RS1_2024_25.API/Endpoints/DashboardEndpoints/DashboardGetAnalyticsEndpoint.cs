using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Helper.Api;
using RS1_2024_25.API.Services;

namespace RS1_2024_25.API.Endpoints.DashboardEndpoints
{
    [MyAuthorization(isAdmin: true)]
    [Route("dashboard")]
    public class DashboardGetAnalyticsEndpoint : MyEndpointBaseAsync
        .WithoutRequest
        .WithResult<DashboardAnalyticsResponse>
    {
        private readonly ApplicationDbContext _db;

        public DashboardGetAnalyticsEndpoint(ApplicationDbContext db)
        {
            _db = db;
        }

        [HttpGet("analytics")]
        public override async Task<DashboardAnalyticsResponse> HandleAsync(CancellationToken cancellationToken = default)
        {
            var now = DateTime.UtcNow;
            var lastMonth = now.AddMonths(-1);
            var lastWeek = now.AddDays(-7);
            var last24Hours = now.AddHours(-24);

            var analytics = new DashboardAnalyticsResponse
            {
                // User Statistics
                UserStats = new UserStatistics
                {
                    TotalUsers = await _db.Users.CountAsync(cancellationToken),
                    ActiveUsers = await _db.Users.CountAsync(u => u.IsOnline, cancellationToken),
                    AdminUsers = await _db.Users.CountAsync(u => u.IsAdmin, cancellationToken)
                },

                // Advertisement Statistics
                AdvertStats = new AdvertisementStatistics
                {
                    TotalAdvertisements = await _db.Advertisements.CountAsync(cancellationToken),
                    ActiveAdvertisements = await _db.Advertisements.CountAsync(a => !a.ExpirationDate.HasValue || a.ExpirationDate > now, cancellationToken),
                    NewAdvertisementsToday = await _db.Advertisements.CountAsync(a => a.ListingDate >= last24Hours, cancellationToken),
                    NewAdvertisementsThisWeek = await _db.Advertisements.CountAsync(a => a.ListingDate >= lastWeek, cancellationToken),
                    NewAdvertisementsThisMonth = await _db.Advertisements.CountAsync(a => a.ListingDate >= lastMonth, cancellationToken),
                    AveragePrice = await _db.Advertisements.AverageAsync(a => a.Price, cancellationToken),
                    TotalViews = await _db.Advertisements.SumAsync(a => a.ViewCount, cancellationToken)
                },

                // Vehicle Statistics
                VehicleStats = new VehicleStatistics
                {
                    TotalCars = await _db.Cars.CountAsync(cancellationToken),
                    ByFuelType = await _db.Cars
                        .GroupBy(c => c.FuelType)
                        .Select(g => new FuelTypeStats { Type = g.Key.ToString(), Count = g.Count() })
                        .ToListAsync(cancellationToken),
                    ByTransmission = await _db.Cars
                        .GroupBy(c => c.Transmission)
                        .Select(g => new TransmissionStats { Type = g.Key.ToString(), Count = g.Count() })
                        .ToListAsync(cancellationToken),
                    AverageYear = await _db.Cars.AverageAsync(c => c.Year, cancellationToken),
                    AverageMileage = await _db.Cars.AverageAsync(c => c.Mileage, cancellationToken)
                },

                // Manufacturer Statistics
                ManufacturerStats = await _db.Cars
                    .Include(c => c.Model)
                    .ThenInclude(m => m.Manufacturer)
                    .Where(c => c.Model != null && c.Model.Manufacturer != null && c.Advertisement != null)
                    .GroupBy(c => new { c.Model.Manufacturer.Name, c.Model.Manufacturer.Country })
                    .Select(g => new ManufacturerStatistics
                    {
                        Name = g.Key.Name,
                        Country = g.Key.Country,
                        TotalCars = g.Count(),
                        AveragePrice = g.Average(c => c.Advertisement.Price),
                        PopularModels = g.GroupBy(c => c.Model.Name)
                            .Select(mg => new ModelStats
                            {
                                Name = mg.Key,
                                Count = mg.Count()
                            })
                            .OrderByDescending(m => m.Count)
                            .Take(3)
                            .ToList()
                    })
                    .OrderByDescending(m => m.TotalCars)
                    .Take(10)
                    .ToListAsync(cancellationToken),

                // View Statistics
                ViewStats = await _db.Advertisements
                    .Where(a => a.Title != null)
                    .OrderByDescending(a => a.ViewCount)
                    .Select(a => new ViewStatistics
                    {
                        AdvertisementId = a.ID,
                        Title = a.Title,
                        ViewCount = a.ViewCount,
                        Price = a.Price,
                        ListingDate = a.ListingDate
                    })
                    .Take(10)
                    .ToListAsync(cancellationToken),

                // Price Range Distribution
                PriceRangeDistribution = await _db.Advertisements
                    .Where(a => a.Price > 0)
                    .Select(a => new
                    {
                        a.Price,
                        Range = (a.Price <= 10000 ? "0-10000" :
                                a.Price <= 20000 ? "10001-20000" :
                                a.Price <= 50000 ? "20001-50000" :
                                a.Price <= 100000 ? "50001-100000" :
                                a.Price <= 200000 ? "100001-200000" :
                                "200000+")
                    })
                    .GroupBy(x => x.Range)
                    .Select(g => new PriceRangeStats
                    {
                        Range = g.Key,
                        Count = g.Count(),
                        AveragePrice = g.Average(x => x.Price)
                    })
                    .ToListAsync(cancellationToken)
            };

            return analytics;
        }
    }

    public class DashboardAnalyticsResponse
    {
        public UserStatistics UserStats { get; set; }
        public AdvertisementStatistics AdvertStats { get; set; }
        public VehicleStatistics VehicleStats { get; set; }
        public List<ManufacturerStatistics> ManufacturerStats { get; set; }
        public List<ViewStatistics> ViewStats { get; set; }
        public List<PriceRangeStats> PriceRangeDistribution { get; set; }
    }

    public class UserStatistics
    {
        public int TotalUsers { get; set; }
        public int ActiveUsers { get; set; }
        public int AdminUsers { get; set; }
    }

    public class AdvertisementStatistics
    {
        public int TotalAdvertisements { get; set; }
        public int ActiveAdvertisements { get; set; }
        public int NewAdvertisementsToday { get; set; }
        public int NewAdvertisementsThisWeek { get; set; }
        public int NewAdvertisementsThisMonth { get; set; }
        public decimal AveragePrice { get; set; }
        public int TotalViews { get; set; }
    }

    public class VehicleStatistics
    {
        public int TotalCars { get; set; }
        public List<FuelTypeStats> ByFuelType { get; set; }
        public List<TransmissionStats> ByTransmission { get; set; }
        public double AverageYear { get; set; }
        public double AverageMileage { get; set; }
    }

    public class FuelTypeStats
    {
        public string Type { get; set; }
        public int Count { get; set; }
    }

    public class TransmissionStats
    {
        public string Type { get; set; }
        public int Count { get; set; }
    }

    public class ManufacturerStatistics
    {
        public string Name { get; set; }
        public string Country { get; set; }
        public int TotalCars { get; set; }
        public decimal AveragePrice { get; set; }
        public List<ModelStats> PopularModels { get; set; }
    }

    public class ModelStats
    {
        public string Name { get; set; }
        public int Count { get; set; }
    }

    public class ViewStatistics
    {
        public int AdvertisementId { get; set; }
        public string Title { get; set; }
        public int ViewCount { get; set; }
        public decimal Price { get; set; }
        public DateTime ListingDate { get; set; }
    }

    public class PriceRangeStats
    {
        public string Range { get; set; }
        public int Count { get; set; }
        public decimal AveragePrice { get; set; }
    }
}
