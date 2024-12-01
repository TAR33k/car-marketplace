using RS1_2024_25.API.Helper;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using Microsoft.VisualBasic.FileIO;
using RS1_2024_25.API.Data.Models.Ad.Advertisement;
using RS1_2024_25.API.Data.Models.Vehicle;
using RS1_2024_25.API.Data.Enums;

namespace RS1_2024_25.API.Data.Models
{
    public class Car : IMyBaseEntity
    {
        [Key]
        public int ID { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        public int Year { get; set; }
        public decimal EngineCapacity { get; set; }

        [Required]
        public FuelType FuelType { get; set; }

        [Required]
        public TransmissionType Transmission { get; set; }

        public int Doors { get; set; }
        public decimal FuelConsumption { get; set; }

        [Range(0, 999999)]
        public int Mileage { get; set; }

        [MaxLength(50)]
        public string Color { get; set; }

        public bool HasServiceHistory { get; set; }

        [ForeignKey(nameof(BodyType))]
        public int BodyID { get; set; }
        public BodyType? BodyType { get; set; }

        [ForeignKey(nameof(City))]
        public int CityID { get; set; }
        public City? City { get; set; }

        [ForeignKey(nameof(CarModel))]
        public int ModelID { get; set; }
        public CarModel? Model { get; set; }

        // Navigation property
        public Advertisement? Advertisement { get; set; }
    }
}
