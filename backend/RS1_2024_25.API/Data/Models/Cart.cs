using RS1_2024_25.API.Data.Models.Auth;
using RS1_2024_25.API.Helper;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace RS1_2024_25.API.Data.Models
{
    public class Cart : IMyBaseEntity
    {
        [Key]
        public int ID { get; set; }
        public decimal TotalPrice { get; set; }
        public DateTime CreatedDate { get; set; }

        [ForeignKey(nameof(User))]
        public int UserID { get; set; }
        public User? User { get; set; }

        [ForeignKey(nameof(StatusType))]
        public int StatusID { get; set; }
        public StatusType? StatusType { get; set; }
    }
}
