using RS1_2024_25.API.Data.Models.Ad.Advertisement;
using RS1_2024_25.API.Data.Models.Auth;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace RS1_2024_25.API.Data.Models
{
    public class SavedAdvertisement
    {
        [Key]
        public int ID { get; set; }

        [ForeignKey(nameof(User))]
        public int UserID { get; set; }
        public User? User { get; set; }

        [ForeignKey(nameof(Advertisement))]
        public int AdvertisementID { get; set; }
        public Advertisement? Advertisement { get; set; }

        public DateTime SavedDate { get; set; }
    }
}
