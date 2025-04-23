using System.Drawing;

namespace PizzaBackend.DTOs.Account
{
    public class NewUserDTO
    {
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string PhoneNumber { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string PostalCode { get; set; }
        public string Token { get; set; }


    }
}
