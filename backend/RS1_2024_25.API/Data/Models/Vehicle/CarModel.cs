using RS1_2024_25.API.Helper;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace RS1_2024_25.API.Data.Models.Vehicle
{
    public class CarModel : IMyBaseEntity
    {
        [Key]
        public int ID { get; set; }

        [Required]
        [MaxLength(100)]
        public string Name { get; set; }

        [MaxLength(500)]
        public string? Description { get; set; }

        public int StartYear { get; set; }
        public int? EndYear { get; set; }

        [ForeignKey(nameof(Manufacturer))]
        public int ManufacturerID { get; set; }
        public Manufacturer? Manufacturer { get; set; }

        // Navigation property
        public virtual ICollection<Car>? Cars { get; set; }
    }
}
