using RS1_2024_25.API.Data.Models.Auth;
using RS1_2024_25.API.Helper;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace RS1_2024_25.API.Data.Models
{
    public class Advertisement : IMyBaseEntity
    {
        [Key]
        public int ID { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Condition { get; set; }
        public decimal Price { get; set; }
        public DateTime ListingDate { get; set; }
        public DateTime ExpirationDate { get; set; }

        [ForeignKey(nameof(Car))]
        public int CarID { get; set; }
        public Car? Car { get; set; }

        [ForeignKey(nameof(User))]
        public int UserID { get; set; }
        public User? User { get; set; }
    }
}
