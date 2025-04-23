using PizzaBackend.DTOs.OrderItem;
using System.Collections.Generic;

namespace PizzaBackend.DTOs.Order
{
    public class CreateOrderRequestDTO
    {
        
        public string DeliveryAddress { get; set; }
        public FrontendCartDTO Cart { get; set; }
    }
}