using PizzaBackend.DTOs.OrderItem;

namespace PizzaBackend.DTOs.Order
{
    public class AdminOrderDTO
    {
        public int Id { get; set; }
        public DateTime OrderDate { get; set; }
        public decimal TotalAmount { get; set; }
        public string Status { get; set; }
        public string DeliveryAddress { get; set; }
        public string FullUserName { get; set; }
        public string UserEmail { get; set; }
        public string UserId { get; set; }
        public List<OrderItemDTO> OrderItems { get; set; } = new List<OrderItemDTO>();
    }
}