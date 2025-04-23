using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.Net.Mail;


namespace PizzaBackend.Models
{
    public class Order
    {
        [Key]
        public int Id { get; set; }
        public string UserId { get; set; }
        public DateTime OrderDate { get; set; } = DateTime.Now;
        public decimal TotalAmount { get; set; }
        public OrderStatus Status { get; set; }
        public string? DeliveryAddress { get; set; }

        public ICollection<OrderItem> OrderItems { get; set; } = new List<OrderItem>();
        
        
        public Payment Payment { get; set; }
        public User User { get; set; }
        
        
        

        public enum OrderStatus
        {
            Pending,    
            Delivered, 
            Cancelled  
        }
    }
}
