using RS1_2024_25.API.Helper;
using System.ComponentModel.DataAnnotations;

namespace RS1_2024_25.API.Data.Models
{
    public class BodyType : IMyBaseEntity
    {
        [Key]
        public int ID { get; set; }
        public string Name { get; set; }
    }
}
