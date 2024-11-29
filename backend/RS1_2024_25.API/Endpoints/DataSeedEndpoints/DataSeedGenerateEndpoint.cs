namespace RS1_2024_25.API.Endpoints.DataSeed;

using Microsoft.AspNetCore.Mvc;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Data.Models;
using RS1_2024_25.API.Data.Models.Auth;
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
                 Name = "Toyota Corolla",
                 Year = 2018,
                 EngineCapacity = 1.8m,
                 FuelType = "Petrol",
                 Transmission = "Automatic",
                 Doors = 4,
                 FuelConsumption = 6.5m,
                 BodyType = bodyTypes[0],
                 City = cities[0]
            },

            new Car
            {
                Name = "Honda Civic",
                Year = 2020,
                EngineCapacity = 2.0m,
                FuelType = "Diesel",
                Transmission = "Manual",
                Doors = 4,
                FuelConsumption = 5.9m,
                BodyType = bodyTypes[0],
                City = cities[0]
            },

            new Car
            {
                Name = "Tesla Model 3",
                Year = 2023,
                EngineCapacity = 0.0m, // Electric vehicles don't have engine capacity in liters
                FuelType = "Electric",
                Transmission = "Automatic",
                Doors = 4,
                FuelConsumption = 0.0m, // No fuel consumption for electric
                BodyType = bodyTypes[0], 
                City = cities[0]
            }
        };

        // Dodavanje podataka u bazu
        await db.Countries.AddRangeAsync(countries, cancellationToken);
        await db.Cities.AddRangeAsync(cities, cancellationToken);
        await db.Users.AddRangeAsync(users, cancellationToken);
        await db.BodyTypes.AddRangeAsync(bodyTypes, cancellationToken);
        await db.Cars.AddRangeAsync(cars, cancellationToken);
        await db.SaveChangesAsync(cancellationToken);

        return "Data generation completed successfully.";
    }
}
