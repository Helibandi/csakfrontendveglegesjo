namespace PizzaBackend.DTOs.Order
{
    public class FrontendCartDTO
    {
        public List<FrontendCartItemDTO> Items { get; set; } = new List<FrontendCartItemDTO>();
    }
}
