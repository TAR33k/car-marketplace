using RS1_2024_25.API.Helper;
using System.ComponentModel.DataAnnotations;

namespace RS1_2024_25.API.Data.Models.Vehicle
{
    public class Manufacturer : IMyBaseEntity
    {
        [Key]
        public int ID { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        [MaxLength(255)]
        public string? LogoUrl { get; set; }

        public string? Country { get; set; }

        public int YearFounded { get; set; }

        // Navigation properties
        public virtual ICollection<CarModel>? Models { get; set; }
    }
}
