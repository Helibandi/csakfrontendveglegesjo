namespace PizzaBackend.DTOs.CartItem
{
    public class AddProductToCartRequestDTO
    {
        public int ProductId { get; set; }
        public int Quantity { get; set; } = 1;
    }
}
