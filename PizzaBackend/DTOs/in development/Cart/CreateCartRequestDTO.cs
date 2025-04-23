using PizzaBackend.DTOs.CartItem;
using System.Collections.Generic;

namespace PizzaBackend.DTOs.Cart
{
    public class CreateCartRequestDTO
    {
        public string UserId { get; set; }
        public List<CreateCartItemRequestDTO> CartItems { get; set; } = new List<CreateCartItemRequestDTO>();
    }
}