using System.ComponentModel.DataAnnotations;

namespace PizzaBackend.DTOs.Account
{
    public class LoginDTO
    {
        [Required]
        public string Email { get; set; }
        [Required]
        public string Password { get; set; }
    }
}
