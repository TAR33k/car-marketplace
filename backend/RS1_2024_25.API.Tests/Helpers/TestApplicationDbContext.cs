using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data.Enums;
using RS1_2024_25.API.Data.Models.Ad.Advertisement;
using RS1_2024_25.API.Data.Models.Auth;
using RS1_2024_25.API.Data.Models.Vehicle;
using RS1_2024_25.API.Data.Models;
using RS1_2024_25.API.Data;

namespace RS1_2024_25.API.Tests.Helpers
{
    public static class TestApplicationDbContext
    {
        public static async Task<ApplicationDbContext> CreateAsync()
        {
            var options = new DbContextOptionsBuilder<ApplicationDbContext>()
                .UseInMemoryDatabase(Guid.NewGuid().ToString())
                .Options;

            var dbContext = new ApplicationDbContext(options);
            await SeedTestData(dbContext);
            return dbContext;
        }

        private static async Task SeedTestData(ApplicationDbContext db)
        {
            // Test Country and City
            var country = new Country { ID = 1, Name = "Test Country" };
            var city = new City { ID = 1, Name = "Test City", Country = country };

            // Test User
            var user = new User
            {
                ID = 1,
                Username = "testuser",
                PasswordHash = Helper.PasswordHelper.HashPassword("Test123!"),
                FirstName = "Test",
                LastName = "User",
                PhoneNumber = "123456789",
                Email = "test@example.com",
                Address = "Test Address",
                IsAdmin = true
            };

            // Test Manufacturer and Model
            var manufacturer = new Manufacturer
            {
                ID = 1,
                Name = "Test Manufacturer",
                Country = "Test Country",
                YearFounded = 1900
            };

            var carModel = new CarModel
            {
                ID = 1,
                Name = "Test Model",
                Manufacturer = manufacturer,
                StartYear = 2000,
                Description = "Test Description"
            };

            // Test Body Type and Status
            var bodyType = new BodyType { ID = 1, Name = "Test Body Type" };
            var statusType = new StatusType { ID = 1, Name = "Active" };

            // Test Car
            var car = new Car
            {
                ID = 1,
                Name = "Test Car",
                Year = 2020,
                EngineCapacity = 2.0m,
                FuelType = FuelType.Petrol,
                Transmission = TransmissionType.Automatic,
                Doors = 4,
                FuelConsumption = 7.0m,
                Mileage = 50000,
                Color = "Test Color",
                HasServiceHistory = true,
                BodyType = bodyType,
                City = city,
                Model = carModel
            };

            // Test Advertisement
            var advertisement = new Advertisement
            {
                ID = 1,
                Title = "Test Advertisement",
                Description = "Test Description",
                Price = 10000,
                ListingDate = DateTime.Now,
                ExpirationDate = DateTime.Now.AddDays(30),
                ViewCount = 0,
                Status = statusType,
                Car = car,
                User = user
            };

            // Test Car Image
            var carImage = new CarImage
            {
                ID = 1,
                ImageUrl = "http://test.com/image.jpg",
                IsPrimary = true,
                UploadedDate = DateTime.Now,
                Advertisement = advertisement
            };

            // Add Authentication Token
            var token = new MyAuthenticationToken
            {
                ID = 1,
                Value = TestHttpContextAccessorHelper.ValidTokenValue,
                RecordedAt = DateTime.Now,
                User = user
            };

            // Add all entities to context
            await db.Countries.AddAsync(country);
            await db.Cities.AddAsync(city);
            await db.Users.AddAsync(user);
            await db.Manufacturers.AddAsync(manufacturer);
            await db.CarModels.AddAsync(carModel);
            await db.BodyTypes.AddAsync(bodyType);
            await db.StatusTypes.AddAsync(statusType);
            await db.Cars.AddAsync(car);
            await db.Advertisements.AddAsync(advertisement);
            await db.CarImages.AddAsync(carImage);
            await db.MyAuthenticationTokens.AddAsync(token);

            await db.SaveChangesAsync();
        }
    }
}
