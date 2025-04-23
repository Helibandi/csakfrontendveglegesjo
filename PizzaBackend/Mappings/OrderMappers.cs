// OrderMappers.cs
using PizzaBackend.DTOs.Order;
using PizzaBackend.DTOs.OrderItem;
using PizzaBackend.Models;

namespace PizzaBackend.Mappings
{
    public static class OrderMappers
    {
        public static OrderDTO ToOrderDTO(this Order order)
        {
            return new OrderDTO
            {
                Id = order.Id,
                OrderDate = order.OrderDate,
                TotalAmount = order.TotalAmount,
                Status = order.Status.ToString(),
                DeliveryAddress = order.DeliveryAddress,
                UserFullName = order.User?.FirstName + " " + order.User?.LastName,
                OrderItems = order.OrderItems?
                    .Select(oi => oi.ToOrderItemDTO())
                    .ToList() ?? new List<OrderItemDTO>()
            };
        }

        public static OrderItemDTO ToOrderItemDTO(this OrderItem orderItem)
        {
            return new OrderItemDTO
            {
                Id = orderItem.Id,
                ProductId = orderItem.ProductId,
                Product = orderItem.Product?.ToProductDTO(),
                Quantity = orderItem.Quantity,
                Price = orderItem.Price
            };
        }

        public static AdminOrderDTO ToAdminOrderDTO(this Order order)
        {
            return new AdminOrderDTO
            {
                Id = order.Id,
                OrderDate = order.OrderDate,
                TotalAmount = order.TotalAmount,
                Status = order.Status.ToString(),
                DeliveryAddress = order.DeliveryAddress,
                FullUserName = order.User?.FirstName + " " + order.User?.LastName,
                UserEmail = order.User?.Email,
                UserId = order.UserId,
                OrderItems = order.OrderItems?
                    .Select(oi => oi.ToOrderItemDTO())
                    .ToList() ?? new List<OrderItemDTO>()
            };
        }
    }
}