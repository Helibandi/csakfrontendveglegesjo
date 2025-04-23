using System.ComponentModel.DataAnnotations;

namespace PizzaBackend.Models
{
    public class Product
    {
        [Key]
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public string ImageUrl { get; set; }
        public decimal Price { get; set; }
        public bool IsAvailable { get; set; } = true;
        public ProductCategory Category { get; set; } = ProductCategory.pizza;
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }

        public ICollection<CartItem> CartItems { get; set; } = new List<CartItem>();
        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
    }

    public enum ProductCategory
    {
        pizza,
        drink
    }
}
