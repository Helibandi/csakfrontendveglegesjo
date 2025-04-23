using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PizzaBackend.DTOs.Cart;
using PizzaBackend.DTOs.CartItem;
using PizzaBackend.Interfaces;
using PizzaBackend.Services;
using System.Security.Claims;
using System.Threading.Tasks;

namespace PizzaBackend.Controllers
{
    [Route("api/[controller]")]
    [ApiExplorerSettings(IgnoreApi = true)]
    [ApiController]
    [Authorize]
    public class CartController : ControllerBase
    {
        private readonly ICartService _cartService;

        public CartController(ICartService cartService)
        {
            _cartService = cartService;
        }

        [HttpPost("add-product")]
        public async Task<IActionResult> AddProductToCart([FromBody] AddProductToCartRequestDTO request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            try
            {
                var cart = await _cartService.AddProductToCartAsync(userId, request);
                return Ok(cart);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
        }

        [HttpGet("my-cart")]
        public async Task<IActionResult> GetUserCart()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var cart = await _cartService.GetUserCartAsync(userId);
            return Ok(cart);
        }

        [HttpDelete("remove-item/{id}")]
        public async Task<IActionResult> RemoveCartItem(int id)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            try
            {
                var cart = await _cartService.RemoveCartItemAsync(userId, id);
                return Ok(cart);
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
        }

        [HttpPut("update-item/{id}")]
        public async Task<IActionResult> UpdateCartItem(int id, [FromBody] UpdateCartItemRequestDTO request)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);

            try
            {
                var cart = await _cartService.UpdateCartItemAsync(userId, id, request);
                return Ok(cart);
            }
            catch (ArgumentException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return NotFound(ex.Message);
            }
        }
    }
}