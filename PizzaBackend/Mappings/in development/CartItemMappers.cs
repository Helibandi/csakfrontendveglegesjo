using PizzaBackend.DTOs.CartItem;
using PizzaBackend.DTOs.Product;
using PizzaBackend.Models;

namespace PizzaBackend.Mappings
{
    public static class CartItemMappers
    {
        public static CartItemDTO MapToCartItemDTO(this CartItem cartItem)
        {
            return new CartItemDTO
            {
                Id = cartItem.Id,
                ProductId = cartItem.ProductId,
                Quantity = cartItem.Quantity,
                Price = cartItem.Price,
                Product = cartItem.Product?.ToProductDTO()
            };
        }

        public static CartItem MapToCartItem(this CreateCartItemRequestDTO dto)
        {
            return new CartItem
            {
                ProductId = dto.ProductId,
                Quantity = dto.Quantity
            };
        }
    }
}