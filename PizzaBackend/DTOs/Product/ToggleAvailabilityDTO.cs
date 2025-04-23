using System.ComponentModel.DataAnnotations;

namespace PizzaBackend.DTOs.Product
{
    public class ToggleAvailabilityDTO
    {
        [Required]
        public bool IsAvailable { get; set; }
    }
}
