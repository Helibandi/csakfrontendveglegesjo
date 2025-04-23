namespace PizzaBackend.DTOs.Account
{
    public class AuthResponseDTO
    {
        
        public string Token { get; set; }
        public string RefreshToken { get; set; }
        public DateTime TokenExpiration { get; set; }

        
    }
}
