using System;
using System.ComponentModel.DataAnnotations;

namespace PizzaBackend.Models
{
    public class Payment
    {
        [Key]
        public int Id { get; set; }
        public int OrderId { get; set; } // Kapcsolat a rendeléssel
        public decimal Amount { get; set; } // Fizetett összeg
        public DateTime PaymentDate { get; set; } = DateTime.Now; // Fizetés dátuma
        public PaymentStatus Status { get; set; } = PaymentStatus.Pending; // Fizetés állapota
        public string PaymentMethod { get; set; } // Fizetési mód (pl. kártya, PayPal stb.)
        public string TransactionId { get; set; } // Tranzakció azonosító

        public Order Order { get; set; } // Navigációs tulajdonság a rendeléshez

        public enum PaymentStatus
        {
            Pending,    // Függőben
            Completed,  // Sikeres
            Failed,     // Sikertelen
            Refunded    // Visszatérítve
        }
    }
}