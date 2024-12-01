using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data.Models;
using RS1_2024_25.API.Data.Models.Ad.Advertisement;
using RS1_2024_25.API.Data.Models.Auth;
using RS1_2024_25.API.Data.Models.Vehicle;

namespace RS1_2024_25.API.Data
{
    public class ApplicationDbContext(
        DbContextOptions options) : DbContext(options)
    {
        public DbSet<City> Cities { get; set; }
        public DbSet<Country> Countries { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<MyAuthenticationToken> MyAuthenticationTokens { get; set; }
        public DbSet<Advertisement> Advertisements { get; set; }
        public DbSet<BodyType> BodyTypes { get; set; }
        public DbSet<Car> Cars { get; set; }
        public DbSet<CarImage> CarImages { get; set; }
        public DbSet<StatusType> StatusTypes { get; set; }
        public DbSet<Manufacturer> Manufacturers { get; set; }
        public DbSet<CarModel> CarModels { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            foreach (var relationship in modelBuilder.Model.GetEntityTypes().SelectMany(e => e.GetForeignKeys()))
            {
                relationship.DeleteBehavior = DeleteBehavior.NoAction;
            }

            // opcija kod nasljeđivanja
            // modelBuilder.Entity<NekaBaznaKlasa>().UseTpcMappingStrategy();

            // Enum conversions
            modelBuilder.Entity<Car>()
                .Property(c => c.FuelType)
                .HasConversion<string>();

            modelBuilder.Entity<Car>()
                .Property(c => c.Transmission)
                .HasConversion<string>();

            // Indexes for better query performance
            modelBuilder.Entity<Car>()
                .HasIndex(c => c.ModelID);

            modelBuilder.Entity<Car>()
                .HasIndex(c => c.BodyID);

            modelBuilder.Entity<Car>()
                .HasIndex(c => c.CityID);

            modelBuilder.Entity<CarModel>()
                .HasIndex(m => m.ManufacturerID);

            modelBuilder.Entity<Advertisement>()
                .HasIndex(a => a.CarID);

            modelBuilder.Entity<Advertisement>()
                .HasIndex(a => a.UserID);

            modelBuilder.Entity<Advertisement>()
                .HasIndex(a => a.StatusID);

            // Unique constraints
            modelBuilder.Entity<Manufacturer>()
                .HasIndex(m => m.Name)
                .IsUnique();

            modelBuilder.Entity<CarModel>()
                .HasIndex(m => new { m.Name, m.ManufacturerID })
                .IsUnique();

            modelBuilder.Entity<BodyType>()
                .HasIndex(b => b.Name)
                .IsUnique();

            // Cascade delete for advertisement images
            modelBuilder.Entity<CarImage>()
                .HasOne(ci => ci.Advertisement)
                .WithMany(a => a.Images)
                .OnDelete(DeleteBehavior.Cascade);

            // Required field configurations
            modelBuilder.Entity<Car>()
                .Property(c => c.EngineCapacity)
                .HasPrecision(5, 2);

            modelBuilder.Entity<Car>()
                .Property(c => c.FuelConsumption)
                .HasPrecision(4, 1);

            modelBuilder.Entity<Advertisement>()
            .Property(a => a.Price)
            .HasPrecision(18, 2);

            // Default values
            modelBuilder.Entity<Advertisement>()
                .Property(a => a.ListingDate)
                .HasDefaultValueSql("GETDATE()");

            modelBuilder.Entity<Advertisement>()
                .Property(a => a.ViewCount)
                .HasDefaultValue(0);
        }
    }
}
