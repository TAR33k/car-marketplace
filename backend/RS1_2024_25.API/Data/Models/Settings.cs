using RS1_2024_25.API.Data.Enums;
using RS1_2024_25.API.Data.Models.Auth;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace RS1_2024_25.API.Data.Models
{
    public class Settings
    {
        [Key]
        public int ID { get; set; }

        [ForeignKey(nameof(User))]
        public int UserID { get; set; }
        public User? User { get; set; }
        
        public bool showEmail { get; set; }
        public bool showPhone { get; set; }
        public bool showLocation { get; set; }
    }
}
