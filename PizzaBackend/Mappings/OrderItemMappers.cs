using PizzaBackend.DTOs.OrderItem;
using PizzaBackend.DTOs.Product;
using PizzaBackend.Models;

namespace PizzaBackend.Mappings
{
    public static class OrderItemMappers
    {
        public static OrderItemDTO MapToOrderItemDTO(this OrderItem orderItem)
        {
            return new OrderItemDTO
            {
                Id = orderItem.Id,
                ProductId = orderItem.ProductId,
                Quantity = orderItem.Quantity,
                Price = orderItem.Price,
                Product = orderItem.Product?.ToProductDTO()
            };
        }

        public static OrderItem MapToOrderItem(this CreateOrderItemRequestDTO dto)
        {
            return new OrderItem
            {
                ProductId = dto.ProductId,
                Quantity = dto.Quantity
            };
        }
    }
}