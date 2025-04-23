using Microsoft.EntityFrameworkCore;
using PizzaBackend.Data;
using PizzaBackend.DTOs.Cart;
using PizzaBackend.DTOs.CartItem;
using PizzaBackend.Interfaces;
using PizzaBackend.Mappings;
using PizzaBackend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace PizzaBackend.Services
{
    public class CartService : ICartService
    {
        private readonly AppDbContext _context;

        public CartService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<CartDTO> AddProductToCartAsync(string userId, AddProductToCartRequestDTO request)
        {
            // Validate product
            var product = await _context.Products.FindAsync(request.ProductId);
            if (product == null)
            {
                throw new ArgumentException($"Product with ID {request.ProductId} not found");
            }

            if (!product.IsAvailable)
            {
                throw new InvalidOperationException($"Product with ID {request.ProductId} is not available");
            }

            if (request.Quantity <= 0)
            {
                throw new ArgumentException("Quantity must be greater than 0");
            }

            // Get or create cart
            var cart = await GetOrCreateActiveCartAsync(userId);

            // Add or update item
            var existingItem = cart.Items.FirstOrDefault(i => i.ProductId == request.ProductId);
            if (existingItem != null)
            {
                existingItem.Quantity += request.Quantity;
            }
            else
            {
                var cartItem = new CartItem
                {
                    CartId = cart.Id,
                    ProductId = product.Id,
                    Quantity = request.Quantity,
                    Price = product.Price
                };
                _context.CartItems.Add(cartItem);
            }

            await _context.SaveChangesAsync();
            return await GetCartDtoAsync(cart.Id);
        }

        public async Task<CartDTO> GetUserCartAsync(string userId)
        {
            var cart = await _context.Carts
                .Include(c => c.Items)
                    .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(c => c.UserId == userId && c.IsActive);

            return cart?.ToCartDTO() ?? new CartDTO
            {
                IsActive = false,
                Items = new List<CartItemDTO>(),
                Pizzas = new List<CartItemDTO>(),
                Drinks = new List<CartItemDTO>()
            };
        }

        public async Task<CartDTO> RemoveCartItemAsync(string userId, int itemId)
        {
            var cart = await GetActiveCartAsync(userId);
            var itemToRemove = cart.Items.FirstOrDefault(i => i.Id == itemId);

            if (itemToRemove == null)
            {
                throw new ArgumentException("Item not found in cart");
            }

            _context.CartItems.Remove(itemToRemove);
            await _context.SaveChangesAsync();

            return await GetCartDtoAsync(cart.Id);
        }

        public async Task<CartDTO> UpdateCartItemAsync(string userId, int itemId, UpdateCartItemRequestDTO request)
        {
            if (request.Quantity <= 0)
            {
                throw new ArgumentException("Quantity must be greater than 0");
            }

            var cart = await GetActiveCartAsync(userId);
            var itemToUpdate = cart.Items.FirstOrDefault(i => i.Id == itemId);

            if (itemToUpdate == null)
            {
                throw new ArgumentException("Item not found in cart");
            }

            itemToUpdate.Quantity = request.Quantity;
            await _context.SaveChangesAsync();

            return await GetCartDtoAsync(cart.Id);
        }

        private async Task<Cart> GetOrCreateActiveCartAsync(string userId)
        {
            var cart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.UserId == userId && c.IsActive);

            if (cart == null)
            {
                cart = new Cart
                {
                    UserId = userId,
                    IsActive = true
                };
                _context.Carts.Add(cart);
                await _context.SaveChangesAsync();
            }

            return cart;
        }

        private async Task<Cart> GetActiveCartAsync(string userId)
        {
            var cart = await _context.Carts
                .Include(c => c.Items)
                .FirstOrDefaultAsync(c => c.UserId == userId && c.IsActive);

            if (cart == null)
            {
                throw new InvalidOperationException("No active cart found");
            }

            return cart;
        }

        private async Task<CartDTO> GetCartDtoAsync(int cartId)
        {
            var cart = await _context.Carts
                .Include(c => c.Items)
                    .ThenInclude(i => i.Product)
                .FirstOrDefaultAsync(c => c.Id == cartId);

            return cart.ToCartDTO();
        }
    }
}