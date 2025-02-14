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
            },
            new Manufacturer
            {
                Name = "Volkswagen",
                Country = "Germany",
                YearFounded = 1937
            },
            new Manufacturer
            {
                Name = "Ford",
                Country = "USA",
                YearFounded = 1903
            },
            new Manufacturer
            {
                Name = "Porsche",
                Country = "Germany",
                YearFounded = 1931
            },
            new Manufacturer
            {
                Name = "Ferrari",
                Country = "Italy",
                YearFounded = 1939
            },
            new Manufacturer
            {
                Name = "Lamborghini",
                Country = "Italy",
                YearFounded = 1963
            },
            new Manufacturer
            {
                Name = "Audi",
                Country = "Germany",
                YearFounded = 1909
            },
            new Manufacturer
            {
                Name = "Nissan",
                Country = "Japan",
                YearFounded = 1933
            },
            new Manufacturer
            {
                Name = "Chevrolet",
                Country = "USA",
                YearFounded = 1911
            },
            new Manufacturer
            {
                Name = "Lexus",
                Country = "Japan",
                YearFounded = 1989
            },
            new Manufacturer
            {
                Name = "Land Rover",
                Country = "UK",
                YearFounded = 1948
            }
        };

        var carModels = new List<CarModel>
        {
            // Toyota Models
            new CarModel
            {
                Name = "Corolla",
                Manufacturer = manufacturers[0],
                StartYear = 1966,
                Description = "Best-selling compact car worldwide"
            },
            new CarModel
            {
                Name = "Land Cruiser",
                Manufacturer = manufacturers[0],
                StartYear = 1951,
                Description = "Legendary SUV known for reliability"
            },
            new CarModel
            {
                Name = "Supra",
                Manufacturer = manufacturers[0],
                StartYear = 1978,
                Description = "Iconic sports car"
            },

            // Honda Models
            new CarModel
            {
                Name = "Civic",
                Manufacturer = manufacturers[1],
                StartYear = 1972,
                Description = "Popular compact car"
            },
            new CarModel
            {
                Name = "CR-V",
                Manufacturer = manufacturers[1],
                StartYear = 1995,
                Description = "Best-selling crossover SUV"
            },
            new CarModel
            {
                Name = "NSX",
                Manufacturer = manufacturers[1],
                StartYear = 1990,
                Description = "Supercar with everyday usability"
            },

            // Tesla Models
            new CarModel
            {
                Name = "Model S",
                Manufacturer = manufacturers[2],
                StartYear = 2012,
                Description = "Revolutionary electric luxury sedan"
            },
            new CarModel
            {
                Name = "Model Y",
                Manufacturer = manufacturers[2],
                StartYear = 2020,
                Description = "Electric crossover SUV"
            },
            new CarModel
            {
                Name = "Cybertruck",
                Manufacturer = manufacturers[2],
                StartYear = 2024,
                Description = "Electric pickup truck"
            },

            // BMW Models
            new CarModel
            {
                Name = "M3",
                Manufacturer = manufacturers[3],
                StartYear = 1986,
                Description = "High-performance luxury sports sedan"
            },
            new CarModel
            {
                Name = "X5",
                Manufacturer = manufacturers[3],
                StartYear = 1999,
                Description = "Luxury SUV"
            },
            new CarModel
            {
                Name = "7 Series",
                Manufacturer = manufacturers[3],
                StartYear = 1977,
                Description = "Flagship luxury sedan"
            },

            // Mercedes-Benz Models
            new CarModel
            {
                Name = "S-Class",
                Manufacturer = manufacturers[4],
                StartYear = 1972,
                Description = "Flagship luxury sedan"
            },
            new CarModel
            {
                Name = "G-Class",
                Manufacturer = manufacturers[4],
                StartYear = 1979,
                Description = "Luxury off-road SUV"
            },
            new CarModel
            {
                Name = "AMG GT",
                Manufacturer = manufacturers[4],
                StartYear = 2014,
                Description = "High-performance sports car"
            },

            // Volkswagen Models
            new CarModel
            {
                Name = "Golf",
                Manufacturer = manufacturers[5],
                StartYear = 1974,
                Description = "Iconic hatchback"
            },
            new CarModel
            {
                Name = "Beetle",
                Manufacturer = manufacturers[5],
                StartYear = 1938,
                Description = "Most produced car on a single platform"
            },
            new CarModel
            {
                Name = "Tiguan",
                Manufacturer = manufacturers[5],
                StartYear = 2007,
                Description = "Compact crossover SUV"
            },

            // Ford Models
            new CarModel
            {
                Name = "Mustang",
                Manufacturer = manufacturers[6],
                StartYear = 1964,
                Description = "Iconic muscle car"
            },
            new CarModel
            {
                Name = "F-150",
                Manufacturer = manufacturers[6],
                StartYear = 1975,
                Description = "Best-selling pickup truck"
            },
            new CarModel
            {
                Name = "Bronco",
                Manufacturer = manufacturers[6],
                StartYear = 1965,
                Description = "Off-road SUV"
            },

            // Porsche Models
            new CarModel
            {
                Name = "911",
                Manufacturer = manufacturers[7],
                StartYear = 1963,
                Description = "Legendary sports car"
            },
            new CarModel
            {
                Name = "Cayenne",
                Manufacturer = manufacturers[7],
                StartYear = 2002,
                Description = "Luxury performance SUV"
            },
            new CarModel
            {
                Name = "Taycan",
                Manufacturer = manufacturers[7],
                StartYear = 2019,
                Description = "High-performance electric car"
            },

            // Ferrari Models
            new CarModel
            {
                Name = "F40",
                Manufacturer = manufacturers[8],
                StartYear = 1987,
                Description = "Iconic supercar"
            },
            new CarModel
            {
                Name = "458 Italia",
                Manufacturer = manufacturers[8],
                StartYear = 2009,
                Description = "Mid-engine sports car"
            },
            new CarModel
            {
                Name = "SF90 Stradale",
                Manufacturer = manufacturers[8],
                StartYear = 2019,
                Description = "Plug-in hybrid supercar"
            },

            // Lamborghini Models
            new CarModel
            {
                Name = "Countach",
                Manufacturer = manufacturers[9],
                StartYear = 1974,
                Description = "Classic supercar"
            },
            new CarModel
            {
                Name = "Aventador",
                Manufacturer = manufacturers[9],
                StartYear = 2011,
                Description = "Flagship V12 supercar"
            },
            new CarModel
            {
                Name = "Urus",
                Manufacturer = manufacturers[9],
                StartYear = 2018,
                Description = "Super SUV"
            },

            // Audi Models
            new CarModel
            {
                Name = "Quattro",
                Manufacturer = manufacturers[10],
                StartYear = 1980,
                Description = "Revolutionary AWD sports car"
            },
            new CarModel
            {
                Name = "R8",
                Manufacturer = manufacturers[10],
                StartYear = 2006,
                Description = "Mid-engine supercar"
            },
            new CarModel
            {
                Name = "Q7",
                Manufacturer = manufacturers[10],
                StartYear = 2005,
                Description = "Luxury SUV"
            },

            // Nissan Models
            new CarModel
            {
                Name = "GT-R",
                Manufacturer = manufacturers[11],
                StartYear = 2007,
                Description = "High-performance sports car"
            },
            new CarModel
            {
                Name = "Z",
                Manufacturer = manufacturers[11],
                StartYear = 1969,
                Description = "Sports car series"
            },
            new CarModel
            {
                Name = "Patrol",
                Manufacturer = manufacturers[11],
                StartYear = 1951,
                Description = "Full-size SUV"
            },

            // Chevrolet Models
            new CarModel
            {
                Name = "Corvette",
                Manufacturer = manufacturers[12],
                StartYear = 1953,
                Description = "American sports car icon"
            },
            new CarModel
            {
                Name = "Camaro",
                Manufacturer = manufacturers[12],
                StartYear = 1966,
                Description = "Classic muscle car"
            },
            new CarModel
            {
                Name = "Silverado",
                Manufacturer = manufacturers[12],
                StartYear = 1998,
                Description = "Full-size pickup truck"
            },

            // Lexus Models
            new CarModel
            {
                Name = "LS",
                Manufacturer = manufacturers[13],
                StartYear = 1989,
                Description = "Flagship luxury sedan"
            },
            new CarModel
            {
                Name = "LFA",
                Manufacturer = manufacturers[13],
                StartYear = 2010,
                Description = "Limited production supercar"
            },
            new CarModel
            {
                Name = "RX",
                Manufacturer = manufacturers[13],
                StartYear = 1998,
                Description = "Luxury crossover SUV"
            },

            // Land Rover Models
            new CarModel
            {
                Name = "Defender",
                Manufacturer = manufacturers[14],
                StartYear = 1983,
                Description = "Iconic off-road vehicle"
            },
            new CarModel
            {
                Name = "Range Rover",
                Manufacturer = manufacturers[14],
                StartYear = 1970,
                Description = "Luxury SUV pioneer"
            },
            new CarModel
            {
                Name = "Discovery",
                Manufacturer = manufacturers[14],
                StartYear = 1989,
                Description = "Premium SUV"
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

        var statusTypes = new List<StatusType>
        {
            new StatusType { Name = "Active" },
            new StatusType { Name = "Sold" },
            new StatusType { Name = "Expired" },
            new StatusType { Name = "Pending" },
            new StatusType { Name = "Rejected" }
        };

        var cars = new List<Car>
        {
            // Sedan - Corolla
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
                HasServiceHistory = true,
                BodyType = bodyTypes[0], // Sedan
                City = cities[0], // Sarajevo
                Model = carModels[0] // Corolla
            },
            // Sport Sedan - M3
            new Car
            {
                Name = "BMW M3 Competition 2022",
                Year = 2022,
                EngineCapacity = 3.0m,
                FuelType = FuelType.Petrol,
                Transmission = TransmissionType.Automatic,
                Doors = 4,
                FuelConsumption = 10.2m,
                Mileage = 25000,
                Color = "Isle of Man Green",
                HasServiceHistory = true,
                BodyType = bodyTypes[0],
                City = cities[3], // Berlin
                Model = carModels[9] // M3
            },
            // Luxury SUV - G-Class
            new Car
            {
                Name = "Mercedes-Benz G63 AMG 2021",
                Year = 2021,
                EngineCapacity = 4.0m,
                FuelType = FuelType.Petrol,
                Transmission = TransmissionType.Automatic,
                Doors = 5,
                FuelConsumption = 13.1m,
                Mileage = 35000,
                Color = "Obsidian Black",
                HasServiceHistory = true,
                BodyType = bodyTypes[2], // SUV
                City = cities[4], // Vienna
                Model = carModels[13] // G-Class
            },
            // Premium SUV - Range Rover
            new Car
            {
                Name = "Range Rover Sport 2023",
                Year = 2023,
                EngineCapacity = 3.0m,
                FuelType = FuelType.Diesel,
                Transmission = TransmissionType.Automatic,
                Doors = 5,
                FuelConsumption = 8.5m,
                Mileage = 15000,
                Color = "Santorini Black",
                HasServiceHistory = true,
                BodyType = bodyTypes[2],
                City = cities[1], // Mostar
                Model = carModels[43] // Range Rover
            },
            // Electric Sedan - Tesla
            new Car
            {
                Name = "Tesla Model S Plaid 2023",
                Year = 2023,
                EngineCapacity = 0.0m,
                FuelType = FuelType.Electric,
                Transmission = TransmissionType.Automatic,
                Doors = 4,
                FuelConsumption = 0.0m,
                Mileage = 8000,
                Color = "Midnight Silver",
                HasServiceHistory = true,
                BodyType = bodyTypes[0],
                City = cities[5], // New York
                Model = carModels[6] // Model S
            },
            // Sports Car - 911
            new Car
            {
                Name = "Porsche 911 GT3 2022",
                Year = 2022,
                EngineCapacity = 4.0m,
                FuelType = FuelType.Petrol,
                Transmission = TransmissionType.DCT,
                Doors = 2,
                FuelConsumption = 12.4m,
                Mileage = 12000,
                Color = "Guards Red",
                HasServiceHistory = true,
                BodyType = bodyTypes[4], // Coupe
                City = cities[3], // Berlin
                Model = carModels[22] // 911
            },
            // Luxury Sedan - S-Class
            new Car
            {
                Name = "Mercedes-Benz S500 2023",
                Year = 2023,
                EngineCapacity = 3.0m,
                FuelType = FuelType.Petrol,
                Transmission = TransmissionType.Automatic,
                Doors = 4,
                FuelConsumption = 8.5m,
                Mileage = 18000,
                Color = "Selenite Grey",
                HasServiceHistory = true,
                BodyType = bodyTypes[0],
                City = cities[3], // Berlin
                Model = carModels[12] // S-Class
            },
            // Super SUV - Urus
            new Car
            {
                Name = "Lamborghini Urus 2022",
                Year = 2022,
                EngineCapacity = 4.0m,
                FuelType = FuelType.Petrol,
                Transmission = TransmissionType.Automatic,
                Doors = 5,
                FuelConsumption = 12.7m,
                Mileage = 22000,
                Color = "Giallo Auge",
                HasServiceHistory = true,
                BodyType = bodyTypes[2],
                City = cities[4], // Vienna
                Model = carModels[29] // Urus
            },
            // Pickup Truck - F-150
            new Car
            {
                Name = "Ford F-150 Raptor 2023",
                Year = 2023,
                EngineCapacity = 3.5m,
                FuelType = FuelType.Petrol,
                Transmission = TransmissionType.Automatic,
                Doors = 4,
                FuelConsumption = 15.7m,
                Mileage = 25000,
                Color = "Code Orange",
                HasServiceHistory = true,
                BodyType = bodyTypes[1], // Pickup
                City = cities[6], // Los Angeles
                Model = carModels[20] // F-150
            }
        };

        var advertisements = new List<Advertisement>
        {
            new Advertisement
            {
                Title = "Reliable Toyota Corolla 2018 - Perfect Family Car",
                Description = "Second owner, regularly maintained Toyota Corolla with full service history. Perfect for daily commuting and family use. Recently serviced with new tires and brakes. Interior is in excellent condition with no wear and tear. Includes backup camera and Toyota Safety Sense package. Fuel efficient and very reliable. Available for viewing in Sarajevo.",
                Price = 19500,
                ListingDate = DateTime.Now.AddDays(-8),
                ViewCount = 156,
                Status = statusTypes[0], // Active
                Car = cars[0],
                User = users[1]
            },
            new Advertisement
            {
                Title = "2022 BMW M3 Competition - Perfect Condition",
                Description = "Stunning Isle of Man Green M3 Competition with only 25,000 km. Full BMW service history and still under warranty until 2025. Loaded with options including carbon fiber package, laser lights, and M Driver's package. Interior is flawless with full leather and carbon trim. Never tracked or modified. Serious inquiries only.",
                Price = 89000,
                ListingDate = DateTime.Now.AddDays(-5),
                ViewCount = 245,
                Status = statusTypes[0],
                Car = cars[1],
                User = users[2]
            },
            new Advertisement
            {
                Title = "2021 Mercedes G63 AMG - Fully Loaded",
                Description = "Exceptional G63 AMG in Obsidian Black. Features include Night Package, 22-inch forged wheels, and Exclusive Interior Package. Burmester 3D surround sound system and rear-seat entertainment. Recently serviced at Mercedes-Benz. All original documentation included. Perfect condition inside and out. Must see to appreciate.",
                Price = 195000,
                ListingDate = DateTime.Now.AddDays(-3),
                ViewCount = 178,
                Status = statusTypes[0],
                Car = cars[2],
                User = users[1]
            },
            new Advertisement
            {
                Title = "2023 Range Rover Sport - Like New",
                Description = "Nearly new Range Rover Sport with only 15,000 km. Autobiography specification including massage seats, panoramic roof, and Meridian Signature sound system. Santorini Black with black leather interior. Advanced Driver Assistance Pack and Park Pack included. Still under full manufacturer warranty. No accidents or damage.",
                Price = 125000,
                ListingDate = DateTime.Now.AddDays(-12),
                ViewCount = 203,
                Status = statusTypes[0],
                Car = cars[3],
                User = users[2]
            },
            new Advertisement
            {
                Title = "2023 Tesla Model S Plaid - Ultimate Performance",
                Description = "Incredible Model S Plaid with Full Self-Driving capability. Midnight Silver exterior with white interior. 21-inch Arachnid wheels and glass roof. Latest software version installed. Acceleration that needs to be experienced to be believed. Perfect condition with clear paint protection film. Includes home charging equipment.",
                Price = 105000,
                ListingDate = DateTime.Now.AddDays(-6),
                ViewCount = 289,
                Status = statusTypes[0],
                Car = cars[4],
                User = users[1]
            },
            new Advertisement
            {
                Title = "2022 Porsche 911 GT3 - Track Ready Beast",
                Description = "Spectacular 911 GT3 in Guards Red. Equipped with Weissach package, ceramic brakes, and front axle lift. Full PPF and ceramic coating applied. Original owner with all documentation and service records. Never tracked or raced. Carbon bucket seats and Club Sport package. The ultimate driver's Porsche. European delivery with photo documentation.",
                Price = 225000,
                ListingDate = DateTime.Now.AddDays(-15),
                ViewCount = 423,
                Status = statusTypes[0],
                Car = cars[5],
                User = users[2]
            },
            new Advertisement
            {
                Title = "2023 Mercedes S500 - Executive Luxury",
                Description = "Immaculate S-Class featuring all available luxury options. Selenite Grey with designo leather interior. Includes Executive Rear Seat Package, 4D surround sound, and augmented reality head-up display. Massage functions for all seats. Perfect for both driver and chauffeur use. Full service history with Mercedes-Benz.",
                Price = 135000,
                ListingDate = DateTime.Now.AddDays(-9),
                ViewCount = 167,
                Status = statusTypes[0],
                Car = cars[6],
                User = users[1]
            },
            new Advertisement
            {
                Title = "2022 Lamborghini Urus - Ultimate Super SUV",
                Description = "Stunning Urus in signature Giallo Auge yellow. Equipped with carbon fiber package, 23-inch wheels, and Bang & Olufsen sound system. Full leather interior with contrast stitching. Advanced Driver Assistance Package and Parking Package included. Fresh service completed at Lamborghini. One owner, never tracked or raced. A true collector's piece.",
                Price = 275000,
                ListingDate = DateTime.Now.AddDays(-11),
                ViewCount = 356,
                Status = statusTypes[0],
                Car = cars[7],
                User = users[2]
            },
            new Advertisement
            {
                Title = "2023 Ford F-150 Raptor - Ultimate Off-Road Machine",
                Description = "Exceptional Raptor with 37-inch tire package and Raptor Technology Package. Code Orange paint with black interior. Features include Pro Power Onboard, 360-degree camera, and spray-in bedliner. Fox Live Valve shocks and Torsen front differential. Perfect for both daily use and weekend adventures. Still under factory warranty.",
                Price = 85000,
                ListingDate = DateTime.Now.AddDays(-7),
                ViewCount = 234,
                Status = statusTypes[0],
                Car = cars[8],
                User = users[1]
            }
        };

        var carImages = new List<CarImage>
        {
            // Toyota Corolla Images
            new CarImage
            {
                ImageUrl = "http://localhost:7000/uploads/images/toyota-corolla-2018-1.jpg",
                IsPrimary = true,
                UploadedDate = DateTime.Now,
                Advertisement = advertisements[0]
            },
            new CarImage
            {
                ImageUrl = "http://localhost:7000/uploads/images/toyota-corolla-2018-2.jpg",
                IsPrimary = false,
                UploadedDate = DateTime.Now,
                Advertisement = advertisements[0]
            },

            // BMW M3 Images
            new CarImage
            {
                ImageUrl = "http://localhost:7000/uploads/images/bmw-m3-2022-1.jpg",
                IsPrimary = true,
                UploadedDate = DateTime.Now,
                Advertisement = advertisements[1]
            },
            new CarImage
            {
                ImageUrl = "http://localhost:7000/uploads/images/bmw-m3-2022-2.jpg",
                IsPrimary = false,
                UploadedDate = DateTime.Now,
                Advertisement = advertisements[1]
            },

            // Mercedes G63 Images
            new CarImage
            {
                ImageUrl = "http://localhost:7000/uploads/images/mercedes-g63-2021-1.jpg",
                IsPrimary = true,
                UploadedDate = DateTime.Now,
                Advertisement = advertisements[2]
            },
            new CarImage
            {
                ImageUrl = "http://localhost:7000/uploads/images/mercedes-g63-2021-2.jpg",
                IsPrimary = false,
                UploadedDate = DateTime.Now,
                Advertisement = advertisements[2]
            },

            // Range Rover Sport Images
            new CarImage
            {
                ImageUrl = "http://localhost:7000/uploads/images/range-rover-sport-2023-1.jpg",
                IsPrimary = true,
                UploadedDate = DateTime.Now,
                Advertisement = advertisements[3]
            },
            new CarImage
            {
                ImageUrl = "http://localhost:7000/uploads/images/range-rover-sport-2023-2.jpg",
                IsPrimary = false,
                UploadedDate = DateTime.Now,
                Advertisement = advertisements[3]
            },

            // Tesla Model S Images
            new CarImage
            {
                ImageUrl = "http://localhost:7000/uploads/images/tesla-models-2023-1.jpg",
                IsPrimary = true,
                UploadedDate = DateTime.Now,
                Advertisement = advertisements[4]
            },
            new CarImage
            {
                ImageUrl = "http://localhost:7000/uploads/images/tesla-models-2023-2.jpg",
                IsPrimary = false,
                UploadedDate = DateTime.Now,
                Advertisement = advertisements[4]
            },

            // Porsche 911 GT3 Images
            new CarImage
            {
                ImageUrl = "http://localhost:7000/uploads/images/porsche-911-gt3-2022-1.jpg",
                IsPrimary = true,
                UploadedDate = DateTime.Now,
                Advertisement = advertisements[5]
            },
            new CarImage
            {
                ImageUrl = "http://localhost:7000/uploads/images/porsche-911-gt3-2022-2.jpg",
                IsPrimary = false,
                UploadedDate = DateTime.Now,
                Advertisement = advertisements[5]
            },

            // Mercedes S500 Images
            new CarImage
            {
                ImageUrl = "http://localhost:7000/uploads/images/mercedes-s500-2023-1.jpg",
                IsPrimary = true,
                UploadedDate = DateTime.Now,
                Advertisement = advertisements[6]
            },
            new CarImage
            {
                ImageUrl = "http://localhost:7000/uploads/images/mercedes-s500-2023-2.jpg",
                IsPrimary = false,
                UploadedDate = DateTime.Now,
                Advertisement = advertisements[6]
            },

            // Lamborghini Urus Images
            new CarImage
            {
                ImageUrl = "http://localhost:7000/uploads/images/lamborghini-urus-2022-1.jpg",
                IsPrimary = true,
                UploadedDate = DateTime.Now,
                Advertisement = advertisements[7]
            },
            new CarImage
            {
                ImageUrl = "http://localhost:7000/uploads/images/lamborghini-urus-2022-2.jpg",
                IsPrimary = false,
                UploadedDate = DateTime.Now,
                Advertisement = advertisements[7]
            },

            // Ford F-150 Raptor Images
            new CarImage
            {
                ImageUrl = "http://localhost:7000/uploads/images/ford-f150-raptor-2023-1.jpg",
                IsPrimary = true,
                UploadedDate = DateTime.Now,
                Advertisement = advertisements[8]
            },
            new CarImage
            {
                ImageUrl = "http://localhost:7000/uploads/images/ford-f150-raptor-2023-2.jpg",
                IsPrimary = false,
                UploadedDate = DateTime.Now,
                Advertisement = advertisements[8]
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
        await db.CarImages.AddRangeAsync(carImages, cancellationToken);

        await db.SaveChangesAsync(cancellationToken);

        return "Data generation completed successfully.";
    }
}
