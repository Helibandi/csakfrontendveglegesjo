using PizzaBackend.DTOs.Cart;
using PizzaBackend.DTOs.CartItem;
using PizzaBackend.Models;
using System.Linq;

namespace PizzaBackend.Mappings
{
    public static class CartMappers
    {
        public static CartDTO ToCartDTO(this Cart cart)
        {
            if (cart == null) return null;

            var cartDto = new CartDTO
            {
                Id = cart.Id,
                IsActive = cart.IsActive,
                Items = cart.Items?
                    .Select(i => i.ToCartItemDTO())
                    .ToList() ?? new List<CartItemDTO>()
            };

            

            return cartDto;
        }

        public static CartItemDTO ToCartItemDTO(this CartItem cartItem)
        {
            return new CartItemDTO
            {
                Id = cartItem.Id,
                ProductId = cartItem.ProductId,
                Product = cartItem.Product?.ToProductDTO(),
                Quantity = cartItem.Quantity,
                Price = cartItem.Price
            };
        }
    }
}