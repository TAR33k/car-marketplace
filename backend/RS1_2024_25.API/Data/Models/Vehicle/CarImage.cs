using RS1_2024_25.API.Helper;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using RS1_2024_25.API.Data.Models.Ad.Advertisement;

namespace RS1_2024_25.API.Data.Models
{
    public class CarImage : IMyBaseEntity
    {
        [Key]
        public int ID { get; set; }

        [Required]
        [MaxLength(255)]
        public string ImageUrl { get; set; }

        public bool IsPrimary { get; set; }

        public DateTime UploadedDate { get; set; }

        [ForeignKey(nameof(Advertisement))]
        public int AdvertisementID { get; set; }
        public Advertisement? Advertisement { get; set; }
    }
}
