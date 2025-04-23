using PizzaBackend.DTOs.Cart;
using PizzaBackend.DTOs.CartItem;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PizzaBackend.Interfaces
{
    public interface ICartService
    {
        Task<CartDTO> AddProductToCartAsync(string userId, AddProductToCartRequestDTO request);
        Task<CartDTO> GetUserCartAsync(string userId);
        Task<CartDTO> RemoveCartItemAsync(string userId, int itemId);
        Task<CartDTO> UpdateCartItemAsync(string userId, int itemId, UpdateCartItemRequestDTO request);
    }
}