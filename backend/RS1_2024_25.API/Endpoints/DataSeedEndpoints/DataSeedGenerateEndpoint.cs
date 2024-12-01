namespace RS1_2024_25.API.Endpoints.DataSeed;

using Microsoft.AspNetCore.Mvc;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Data.Enums;
using RS1_2024_25.API.Data.Models;
using RS1_2024_25.API.Data.Models.Ad.Advertisement;
using RS1_2024_25.API.Data.Models.Auth;
using RS1_2024_25.API.Data.Models.Vehicle;
using RS1_2024_25.API.Helper.Api;
using System.Collections.Generic;
using System.Threading;
using System.Threading.Tasks;

[Route("data-seed")]
public class DataSeedGenerateEndpoint(ApplicationDbContext db)
    : MyEndpointBaseAsync
    .WithoutRequest
    .WithResult<string>
{
    [HttpPost]
    public override async Task<string> HandleAsync(CancellationToken cancellationToken = default)
    {
        if (db.Users.Any())
        {
            throw new Exception("Podaci su vec generisani");
        }

        // Kreiranje država
        var countries = new List<Country>
        {
            new Country { Name = "Bosnia and Herzegovina" },
            new Country { Name = "Croatia" },
            new Country { Name = "Germany" },
            new Country { Name = "Austria" },
            new Country { Name = "USA" }
        };

        // Kreiranje gradova
        var cities = new List<City>
        {
            new City { Name = "Sarajevo", Country = countries[0] },
            new City { Name = "Mostar", Country = countries[0] },
            new City { Name = "Zagreb", Country = countries[1] },
            new City { Name = "Berlin", Country = countries[2] },
            new City { Name = "Vienna", Country = countries[3] },
            new City { Name = "New York", Country = countries[4] },
            new City { Name = "Los Angeles", Country = countries[4] }
        };

        // Kreiranje korisnika s ulogama
        var users = new List<User>
        {
            new User
            {
                Username = "admin1",
                PasswordHash = Helper.PasswordHelper.HashPassword("admin1"),
                FirstName = "Admin",
                LastName = "One",
                PhoneNumber = "123123123",
                Email = "admin@admin.com",
                Address = "Admin address 1",
                IsAdmin = true
            },
            new User
            {
                Username = "user1",
                PasswordHash = Helper.PasswordHelper.HashPassword("user123"),
                FirstName = "User",
                LastName = "One",
                PhoneNumber = "123456789",
                Email = "user1@user.com",
                Address = "User address 1",
                IsAdmin = false 
            },
            new User
            {
                Username = "user2",
                PasswordHash = Helper.PasswordHelper.HashPassword("user456"),
                FirstName = "User",
                LastName = "Two",
                PhoneNumber = "987654321",
                Email = "user2@user.com",
                Address = "User address 2",
                IsAdmin = false
            }
        };

        var manufacturers = new List<Manufacturer>
        {
            new Manufacturer
            {
                Name = "Toyota",
                Country = "Japan",
                YearFounded = 1937
            },
            new Manufacturer
            {
                Name = "Honda",
                Country = "Japan",
                YearFounded = 1948
            },
            new Manufacturer
            {
                Name = "Tesla",
                Country = "USA",
                YearFounded = 2003
            },
            new Manufacturer
            {
                Name = "BMW",
                Country = "Germany",
                YearFounded = 1916
            },
            new Manufacturer
            {
                Name = "Mercedes-Benz",
                Country = "Germany",
                YearFounded = 1926
            }
        };

        var carModels = new List<CarModel>
        {
            new CarModel
            {
                Name = "Corolla",
                Manufacturer = manufacturers[0],
                StartYear = 1966,
                Description = "Compact car"
            },
            new CarModel
            {
                Name = "Civic",
                Manufacturer = manufacturers[1],
                StartYear = 1972,
                Description = "Compact car"
            },
            new CarModel
            {
                Name = "Model 3",
                Manufacturer = manufacturers[2],
                StartYear = 2017,
                Description = "Electric sedan"
            },
            new CarModel
            {
                Name = "Prius",
                Manufacturer = manufacturers[0],
                StartYear = 1997,
                Description = "Hybrid electric car"
            },
            new CarModel
            {
                Name = "M3",
                Manufacturer = manufacturers[3],
                StartYear = 1986,
                Description = "High-performance luxury sports car"
            }
        };

        var bodyTypes = new List<BodyType>
        {
            new BodyType { Name = "Sedan" },
            new BodyType { Name = "Pickup" },
            new BodyType { Name = "SUV" },
            new BodyType { Name = "Hatchback" },
            new BodyType { Name = "Coupe" },
            new BodyType { Name = "Convertible" },
            new BodyType { Name = "Wagon" },
            new BodyType { Name = "Van" }
        };

        var cars = new List<Car>
        {
            new Car
            {
                 Name = "Toyota Corolla 2018",
                 Year = 2018,
                 EngineCapacity = 1.8m,
                 FuelType = FuelType.Petrol,
                 Transmission = TransmissionType.Automatic,
                 Doors = 4,
                 FuelConsumption = 6.5m,
                 Mileage = 85000,
                 Color = "Black Sapphire",
                 HasServiceHistory = false,
                 BodyType = bodyTypes[0],
                 City = cities[0],
                 Model = carModels[0]  
            },
            new Car
            {
                Name = "Honda Civic 2020",
                Year = 2020,
                EngineCapacity = 2.0m,
                FuelType = FuelType.Diesel,
                Transmission = TransmissionType.Manual,
                Doors = 4,
                FuelConsumption = 5.9m,
                Mileage = 55000,
                Color = "Pure White",
                HasServiceHistory = true,
                BodyType = bodyTypes[0],
                City = cities[0],
                Model = carModels[1]  
            },
            new Car
            {
                Name = "Tesla Model 3 2023",
                Year = 2023,
                EngineCapacity = 0.0m,
                FuelType = FuelType.Electric,
                Transmission = TransmissionType.Automatic,
                Doors = 4,
                FuelConsumption = 0.0m,
                Mileage = 12000,
                Color = "Black",
                HasServiceHistory = true,
                BodyType = bodyTypes[0],
                City = cities[0],
                Model = carModels[2]  
            },
            new Car
            {
                Name = "Toyota Prius 2022",
                Year = 2022,
                EngineCapacity = 1.8m,
                FuelType = FuelType.Hybrid,
                Transmission = TransmissionType.CVT,
                Doors = 4,
                FuelConsumption = 4.2m,
                Mileage = 20000,
                Color = "Blue",
                HasServiceHistory = true,
                BodyType = bodyTypes[0],
                City = cities[1],
                Model = carModels[3]
            },
            new Car
            {
                Name = "BMW M3 2023",
                Year = 2023,
                EngineCapacity = 3.0m,
                FuelType = FuelType.Petrol,
                Transmission = TransmissionType.DCT,
                Doors = 2,
                FuelConsumption = 9.8m,
                Mileage = 13000,
                Color = "Red",
                HasServiceHistory = false,
                BodyType = bodyTypes[4],
                City = cities[2],
                Model = carModels[4]
            }
        };

        var statusTypes = new List<StatusType>
        {
            new StatusType { Name = "Active" },
            new StatusType { Name = "Sold" },
            new StatusType { Name = "Expired" },
            new StatusType { Name = "Pending" },
            new StatusType { Name = "Rejected" }
        };

        var advertisements = new List<Advertisement>
        {
            new Advertisement
            {
                Title = "Well maintained Toyota Corolla",
                Description = "Perfect family car, regular service history",
                Price = 25000,
                ListingDate = DateTime.Now,
                ViewCount = 0,
                Status = statusTypes[0], // Active
                Car = cars[0],
                User = users[1]
            },
            new Advertisement
            {
                Title = "Honda Civic - Low Mileage",
                Description = "Excellent condition, one owner",
                Price = 28000,
                ListingDate = DateTime.Now,
                ViewCount = 0,
                Status = statusTypes[0], // Active
                Car = cars[1],
                User = users[2]
            }
        };

        // Dodavanje podataka u bazu
        await db.Countries.AddRangeAsync(countries, cancellationToken);
        await db.Cities.AddRangeAsync(cities, cancellationToken);
        await db.Users.AddRangeAsync(users, cancellationToken);
        await db.Manufacturers.AddRangeAsync(manufacturers, cancellationToken);
        await db.CarModels.AddRangeAsync(carModels, cancellationToken);
        await db.BodyTypes.AddRangeAsync(bodyTypes, cancellationToken);
        await db.Cars.AddRangeAsync(cars, cancellationToken);
        await db.StatusTypes.AddRangeAsync(statusTypes, cancellationToken);
        await db.Advertisements.AddRangeAsync(advertisements, cancellationToken);

        await db.SaveChangesAsync(cancellationToken);

        return "Data generation completed successfully.";
    }
}
