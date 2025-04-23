using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using PizzaBackend.DTOs.Account;
using PizzaBackend.Interfaces;
using PizzaBackend.Models;
using System.Threading.Tasks;

namespace PizzaBackend.Controllers
{
    [Route("api/admin")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly ITokenService _tokenService;
        private readonly RoleManager<IdentityRole> _roleManager;

        public AdminController(
            UserManager<User> userManager,
            ITokenService tokenService,
            RoleManager<IdentityRole> roleManager)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _roleManager = roleManager;
        }

        [HttpPost("create-admin")]
        public async Task<IActionResult> CreateAdminAccount([FromBody] RegisterDTO registerDto)
        {
            // 1. Validáció
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // 2. Ellenőrizzük, hogy létezik-e már az email
            var existingUser = await _userManager.FindByEmailAsync(registerDto.Email);
            if (existingUser != null)
                return BadRequest("Email already in use");

            // 3. Új felhasználó létrehozása
            var user = new User
            {
                UserName = registerDto.Email,
                Email = registerDto.Email,
                FirstName = registerDto.FirstName,
                LastName = registerDto.LastName,
                PhoneNumber = registerDto.PhoneNumber,
                Address = registerDto.Address,
                City = registerDto.City,
                PostalCode = registerDto.PostalCode
            };

            // 4. Felhasználó létrehozása jelszóval
            var result = await _userManager.CreateAsync(user, registerDto.Password);
            if (!result.Succeeded)
                return BadRequest(result.Errors);

            // 5. Ellenőrizzük, hogy létezik-e az Admin szerepkör
            if (!await _roleManager.RoleExistsAsync("Admin"))
            {
                await _roleManager.CreateAsync(new IdentityRole("Admin"));
            }

            // 6. Admin szerepkör hozzárendelése
            var roleResult = await _userManager.AddToRoleAsync(user, "Admin");
            if (!roleResult.Succeeded)
                return BadRequest(roleResult.Errors);

            // 7. Token generálása
            var token = await _tokenService.CreateToken(user);

            // 8. Válasz
            return Ok(new
            {
                Email = user.Email,
                Token = token,
                Message = "Admin account created successfully"
            });
        }
    }
}