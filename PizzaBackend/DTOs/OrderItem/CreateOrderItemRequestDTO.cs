namespace PizzaBackend.DTOs.OrderItem
{
    public class CreateOrderItemRequestDTO
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; }
        
    }
}