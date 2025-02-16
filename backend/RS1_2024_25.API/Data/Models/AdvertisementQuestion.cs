using RS1_2024_25.API.Data.Models.Ad.Advertisement;
using RS1_2024_25.API.Data.Models.Auth;
using RS1_2024_25.API.Helper;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace RS1_2024_25.API.Data.Models
{
    public class AdvertisementQuestion : IMyBaseEntity
    {
        [Key]
        public int ID { get; set; }

        [Required]
        [MaxLength(1000)]
        public string Content { get; set; }

        public DateTime CreatedAt { get; set; }

        [MaxLength(1000)]
        public string? Answer { get; set; }

        public DateTime? AnsweredAt { get; set; }

        [ForeignKey(nameof(Advertisement))]
        public int AdvertisementID { get; set; }
        public Advertisement? Advertisement { get; set; }

        [ForeignKey(nameof(User))]
        public int UserID { get; set; }
        public User? User { get; set; }
    }
}
