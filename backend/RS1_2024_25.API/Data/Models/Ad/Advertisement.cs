using RS1_2024_25.API.Data.Models.Auth;
using RS1_2024_25.API.Helper;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using RS1_2024_25.API.Data.Enums;

namespace RS1_2024_25.API.Data.Models.Ad.Advertisement
{
    public class Advertisement : IMyBaseEntity
    {
        [Key]
        public int ID { get; set; }

        [Required]
        [MaxLength(100)]
        public string Title { get; set; }

        [MaxLength(1000)]
        public string Description { get; set; }

        [Required]
        public VehicleCondition Condition { get; set; }

        [Required]
        [Range(0, double.MaxValue)]
        public decimal Price { get; set; }

        [Required]
        public DateTime ListingDate { get; set; }

        public DateTime? ExpirationDate { get; set; }

        public int ViewCount { get; set; }

        [ForeignKey(nameof(StatusType))]
        public int StatusID { get; set; }
        public StatusType? Status { get; set; }

        [ForeignKey(nameof(Car))]
        public int CarID { get; set; }
        public Car? Car { get; set; }

        [ForeignKey(nameof(User))]
        public int UserID { get; set; }
        public User? User { get; set; }

        // Navigation property
        public virtual ICollection<CarImage>? Images { get; set; }
    }
}
