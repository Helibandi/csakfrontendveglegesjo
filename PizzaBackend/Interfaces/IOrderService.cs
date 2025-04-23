using PizzaBackend.DTOs.Order;
using PizzaBackend.Models;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace PizzaBackend.Interfaces
{
    public interface IOrderService
    {
        Task<IEnumerable<OrderDTO>> GetUserOrdersAsync(string userId);
        Task<OrderDTO> GetOrderByIdAsync(int id, string userId);
        Task<OrderDTO> CreateOrderAsync(CreateOrderRequestDTO orderDto, string userId);
        Task<OrderDTO> UpdateOrderStatusAsync(int id, UpdateOrderStatusDTO statusDto);

        Task<IEnumerable<AdminOrderDTO>> GetAllOrdersAsync();
    }
}