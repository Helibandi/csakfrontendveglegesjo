using PizzaBackend.DTOs.OrderItem;
using PizzaBackend.Models;
using System.Drawing;
using static PizzaBackend.Models.Order;

namespace PizzaBackend.DTOs.Order
{
    public class OrderDTO
    {
        public int Id { get; set; }
        public string UserFullName { get; set; }
        public DateTime OrderDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; }
        public string DeliveryAddress { get; set; }
        public List<OrderItemDTO> OrderItems { get; set; } = new List<OrderItemDTO>();
    }
}
