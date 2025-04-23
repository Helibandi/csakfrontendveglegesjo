using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Authorization.Infrastructure;
using Microsoft.AspNetCore.Identity;
using Microsoft.Identity.Client;
using PizzaBackend.Controllers;
using StackExchange.Redis;

namespace PizzaBackend.Models
{
    public class User : IdentityUser 
    {
        
        [MaxLength(100)]
        public string FirstName { get; set; }
        [MaxLength(100)]
        public string LastName { get; set; }
        [MaxLength(200)]
        public string Address { get; set; }
        [MaxLength(100)]
        public string City { get; set; }
        [MaxLength(20)]
        public string PostalCode { get; set; }

        //username
        //password
        //email
        //phone number


        public ICollection<Order> Orders { get; set; }
        public ICollection<RefreshToken> RefreshTokens { get; set; }
        public ICollection<Cart> Carts { get; set; }

    }

    
}
