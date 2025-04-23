using PizzaBackend.DTOs.CartItem;
using PizzaBackend.Models;
using System.Collections.Generic;

namespace PizzaBackend.DTOs.Cart
{
    public class CartDTO
    {
        public int Id { get; set; }
        public bool IsActive { get; set; }
        public DateTime CreatedAt { get; set; }

        // Összes termék
        public List<CartItemDTO> Items { get; set; } = new List<CartItemDTO>();

        // Külön listák kategóriánként
        public List<CartItemDTO> Pizzas { get; set; } = new List<CartItemDTO>();
        public List<CartItemDTO> Drinks { get; set; } = new List<CartItemDTO>();

        // Összesítések
        public decimal TotalPrice => Items.Sum(i => i.TotalPrice);
        public int TotalItems => Items.Sum(i => i.Quantity);
    }
}