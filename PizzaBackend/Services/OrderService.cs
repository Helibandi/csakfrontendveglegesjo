using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using PizzaBackend.Data;
using PizzaBackend.DTOs.Cart;
using PizzaBackend.DTOs.CartItem;
using PizzaBackend.DTOs.Order;
using PizzaBackend.Interfaces;
using PizzaBackend.Mappings;
using PizzaBackend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using static PizzaBackend.Models.Order;

namespace PizzaBackend.Services
{
    public class OrderService : IOrderService
    {
        private readonly AppDbContext _context;
        private readonly UserManager<User> _userManager;

        public OrderService(AppDbContext context, UserManager<User> userManager)
        {
            _context = context;
            _userManager = userManager;
        }

        public async Task<IEnumerable<AdminOrderDTO>> GetAllOrdersAsync()
        {
            return await GetOrdersWithDetails()
                .OrderByDescending(o => o.OrderDate)
                .Select(o => o.ToAdminOrderDTO())
                .ToListAsync();
        }

        public async Task<IEnumerable<OrderDTO>> GetUserOrdersAsync(string userId)
        {
            return await GetOrdersWithDetails()
                .Where(o => o.UserId == userId)
                .OrderByDescending(o => o.OrderDate)
                .Select(o => o.ToOrderDTO())
                .ToListAsync();
        }

        public async Task<OrderDTO> GetOrderByIdAsync(int id, string userId)
        {
            var order = await GetOrdersWithDetails()
                .FirstOrDefaultAsync(o => o.Id == id);

            if (order == null || order.UserId != userId)
                return null;

            return order.ToOrderDTO();
        }

        public async Task<OrderDTO> CreateOrderAsync(CreateOrderRequestDTO orderDto, string userId)
        {
            var user = await GetUserOrThrowAsync(userId);
            ValidateCart(orderDto.Cart);

            // Explicitly declare the tuple variables to avoid type inference issues
            var result = await CreateOrderItemsAsync(orderDto.Cart.Items);
            var orderItems = result.items;
            var totalAmount = result.total;

            var deliveryAddress = GetValidDeliveryAddress(user, orderDto.DeliveryAddress);

            var order = new Order
            {
                UserId = userId,
                User = user,
                OrderDate = DateTime.UtcNow,
                Status = OrderStatus.Pending,
                DeliveryAddress = deliveryAddress,
                OrderItems = orderItems,
                TotalAmount = totalAmount
            };

            _context.Orders.Add(order);
            await _context.SaveChangesAsync();

            return order.ToOrderDTO();
        }

        public async Task<OrderDTO> UpdateOrderStatusAsync(int id, UpdateOrderStatusDTO statusDto)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order == null) return null;

            order.Status = ParseOrderStatus(statusDto.Status);
            await _context.SaveChangesAsync();

            return order.ToOrderDTO();
        }

        private IQueryable<Order> GetOrdersWithDetails()
        {
            return _context.Orders
                .Include(o => o.User)
                .Include(o => o.OrderItems)
                    .ThenInclude(oi => oi.Product);
        }

        private async Task<User> GetUserOrThrowAsync(string userId)
        {
            var user = await _userManager.FindByIdAsync(userId);
            if (user == null) throw new UnauthorizedAccessException("User not found");
            return user;
        }

        private void ValidateCart(FrontendCartDTO cart)
        {
            if (cart?.Items == null || !cart.Items.Any())
            {
                throw new InvalidOperationException("Cart is empty");
            }
        }

        private async Task<(List<OrderItem> items, decimal total)> CreateOrderItemsAsync(List<FrontendCartItemDTO> cartItems)
        {
            var productIds = cartItems.Select(i => i.ProductId).ToList();
            var products = await _context.Products
                .Where(p => productIds.Contains(p.Id))
                .ToDictionaryAsync(p => p.Id);

            var orderItems = new List<OrderItem>();
            decimal totalAmount = 0;

            foreach (var item in cartItems)
            {
                if (!products.TryGetValue(item.ProductId, out var product))
                {
                    throw new ArgumentException($"Product with ID {item.ProductId} not found");
                }

                if (!product.IsAvailable)
                {
                    throw new ArgumentException($"Product with ID {item.ProductId} is not available");
                }

                if (item.Quantity <= 0)
                {
                    throw new ArgumentException("Quantity must be greater than 0");
                }

                var orderItem = new OrderItem
                {
                    ProductId = item.ProductId,
                    Quantity = item.Quantity,
                    Price = product.Price
                };

                orderItems.Add(orderItem);
                totalAmount += orderItem.Price * orderItem.Quantity;
            }

            return (orderItems, totalAmount);
        }

        private Product GetValidProduct(Dictionary<int, Product> products, CartItemDTO item)
        {
            if (!products.TryGetValue(item.ProductId, out var product))
                throw new ArgumentException($"Product with ID {item.ProductId} not found");

            if (!product.IsAvailable)
                throw new ArgumentException($"Product with ID {item.ProductId} is not available");

            if (item.Quantity <= 0)
                throw new ArgumentException("Quantity must be greater than 0");

            return product;
        }

        private OrderItem CreateOrderItem(CartItemDTO item, Product product)
        {
            return new OrderItem
            {
                ProductId = item.ProductId,
                Quantity = item.Quantity,
                Price = product.Price
            };
        }

        private string GetValidDeliveryAddress(User user, string providedAddress)
        {
            if (!string.IsNullOrEmpty(user.Address) &&
                !string.IsNullOrEmpty(user.City) &&
                !string.IsNullOrEmpty(user.PostalCode))
            {
                return $"{user.PostalCode}, {user.City}, {user.Address}";
            }

            if (string.IsNullOrEmpty(providedAddress))
                throw new ArgumentException("Delivery address is required");

            return providedAddress;
        }

        private OrderStatus ParseOrderStatus(string status)
        {
            if (!Enum.TryParse(status, out OrderStatus result))
                throw new ArgumentException($"Invalid order status: {status}");

            return result;
        }
    }
}