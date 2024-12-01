using RS1_2024_25.API.Helper;
using System.ComponentModel.DataAnnotations;

namespace RS1_2024_25.API.Data.Models;

public class Country : IMyBaseEntity
{
    [Key]
    public int ID { get; set; }

    [Required]
    [MaxLength(50)]
    public string Name { get; set; }

    // Navigation property
    public virtual ICollection<City>? Cities { get; set; }
}