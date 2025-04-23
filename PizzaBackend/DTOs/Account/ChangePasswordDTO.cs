using System.Drawing;

namespace PizzaBackend.DTOs.Account
{
    public class ChangePasswordDTO
    {
        public string OldPassword { get; set; }
        public string NewPassword { get; set; }
    }
}
