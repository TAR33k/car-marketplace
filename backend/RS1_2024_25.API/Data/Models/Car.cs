using RS1_2024_25.API.Helper;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace RS1_2024_25.API.Data.Models
{
    public class Car : IMyBaseEntity
    {
        [Key]
        public int ID { get; set; }
        public string Name { get; set; }
        public int Year { get; set; }
        public decimal EngineCapacity { get; set; }
        public string FuelType { get; set; }
        public string Transmission { get; set; }
        public int Doors { get; set; }
        public decimal FuelConsumption { get; set; }

        [ForeignKey(nameof(BodyType))]
        public int BodyID { get; set; }
        public BodyType? BodyType { get; set; }

        [ForeignKey(nameof(City))]
        public int CityID { get; set; }
        public City? City { get; set; }
    }
}
