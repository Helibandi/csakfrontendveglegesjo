using System.ComponentModel.DataAnnotations;

namespace PizzaBackend.DTOs.Account
{
    public class UserProfileDTO
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string Address { get; set; }
        public string City { get; set; }
        public string PostalCode { get; set; }

        [Phone]
        public string PhoneNumber { get; set; }
    }
}
