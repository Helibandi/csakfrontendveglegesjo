using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using NuGet.Common;
using PizzaBackend.Data;
using PizzaBackend.DTOs.Account;
using PizzaBackend.Interfaces;
using PizzaBackend.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Threading.Tasks;


namespace PizzaBackend.Controllers
{
    [Route("api/account")]
    [ApiController]
    
    public class AccountController : ControllerBase
    {
        private readonly UserManager<User> _userManager;
        private readonly ITokenService _tokenService;
        private readonly SignInManager<User> _signInManager;
        private readonly AppDbContext _context;
        private readonly IConfiguration _config;
        public AccountController(UserManager<User> userManager, ITokenService tokenService, SignInManager<User> signinmanager, AppDbContext context, IConfiguration config)
        {
            _userManager = userManager;
            _tokenService = tokenService;
            _signInManager = signinmanager;
            _context = context;
            _config = config;
        }


        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDTO loginDTO)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await _userManager.Users.FirstOrDefaultAsync(x => x.Email == loginDTO.Email.ToLower());

            if (user == null)
                return Unauthorized("Invalid Email!");

            var result = await _signInManager.CheckPasswordSignInAsync(user, loginDTO.Password, false);

            if (!result.Succeeded)
                return Unauthorized("Email not found or password incorrect!");

            var oldTokens = _context.RefreshTokens.Where(x => x.UserId == user.Id);
            _context.RefreshTokens.RemoveRange(oldTokens);

            // Itt volt a hiba: await hiányzott
            var token = await _tokenService.CreateToken(user);
            var refreshToken = _tokenService.CreateRefreshToken();

            _context.RefreshTokens.Add(new RefreshToken
            {
                UserId = user.Id,
                Token = refreshToken,
                Expires = DateTime.Now.AddDays(7)
            });

            await _context.SaveChangesAsync();

            return Ok(
                new AuthResponseDTO
                {
                    Token = token,
                    RefreshToken = refreshToken,
                    TokenExpiration = DateTime.Now.AddSeconds(_config.GetValue<int>("JWT:AccesTokenExpirationMinutes")),
                });
        }


      




        [HttpPost("refresh-token")]
        public async Task<IActionResult> RefreshToken([FromBody] RefreshTokenRequestDTO request)
        {
            if (string.IsNullOrEmpty(request.Token) || string.IsNullOrEmpty(request.RefreshToken))
                return BadRequest("Invalid Token!");

            var principal = _tokenService.GetPrincipalFromExpiredToken(request.Token);
            var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
                return BadRequest("Invalid Token!");

            var storedRefreshToken = await _context.RefreshTokens.FirstOrDefaultAsync(x => x.Token == request.RefreshToken && x.UserId == userId);

            if (storedRefreshToken == null || storedRefreshToken.IsExpired || !storedRefreshToken.IsActive)
                return BadRequest("Invalid Refresh Token!");

            // Itt volt a hiba: await hiányzott
            var newToken = await _tokenService.CreateToken(user);
            var newRefreshToken = _tokenService.CreateRefreshToken();

            _context.RefreshTokens.Remove(storedRefreshToken);
            _context.RefreshTokens.Add(new RefreshToken
            {
                UserId = user.Id,
                Token = newRefreshToken,
                Expires = DateTime.Now.AddDays(7)
            });
            await _context.SaveChangesAsync();

            return Ok(new AuthResponseDTO
            {

                Token = newToken,
                RefreshToken = newRefreshToken,
                TokenExpiration = DateTime.Now.AddSeconds(_config.GetValue<int>("JWT:AccesTokenExpirationSeconds"))


            });
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDTO RegisterDTO)
        {
            try
            {
                if (!ModelState.IsValid)
                    return BadRequest(ModelState);

                var user = new User
                {
                    UserName = RegisterDTO.Email,
                    Email = RegisterDTO.Email,
                    FirstName = RegisterDTO.FirstName,
                    LastName = RegisterDTO.LastName,
                    PhoneNumber = RegisterDTO.PhoneNumber,
                    Address = RegisterDTO.Address,
                    City = RegisterDTO.City,
                    PostalCode = RegisterDTO.PostalCode
                };

                var createUser = await _userManager.CreateAsync(user, RegisterDTO.Password);

                if (createUser.Succeeded)
                {
                    var roleResult = await _userManager.AddToRoleAsync(user, "User");
                    if (roleResult.Succeeded)
                    {

                        return Ok(
                            new NewUserDTO
                            {
                                Email = user.Email,
                                FirstName = user.FirstName,
                                LastName = user.LastName,
                                PhoneNumber = user.PhoneNumber,
                                Address = user.Address,
                                City = user.City,
                                PostalCode = user.PostalCode,
                                Token = await _tokenService.CreateToken(user),

                                

                            });
                    }
                    else
                    {
                        return StatusCode(500, roleResult.Errors);
                    }
                }
                else
                {
                    return StatusCode(500, createUser.Errors);
                }
            }
            catch (Exception e)
            {
                return StatusCode(500, e.Message);
            }
        }
    




        [HttpGet("get-me")]
        [Authorize]
        
        public async Task<ActionResult<UserWithRoleDTO>> GetCurrentUser()
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
                return NotFound();

            var roles = await _userManager.GetRolesAsync(user);

            return Ok(new UserWithRoleDTO
            {
                Id = user.Id,
                Email = user.Email,
                FirstName = user.FirstName,
                LastName = user.LastName,
                Address = user.Address,
                City = user.City,
                PostalCode = user.PostalCode,
                PhoneNumber = user.PhoneNumber,
                Roles = roles.ToList()
            });
        }


        [HttpPut("{id}/edit-user")]
        [Authorize]

        public async Task<IActionResult> UpdateUser(string id, [FromBody] UserUpdateDTO userDTO)
        {
            var currentUserId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var isAdmin = User.IsInRole("Admin");

            if (currentUserId != id && !isAdmin)
                return Forbid();

            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
                return NotFound();

            user.FirstName = userDTO.FirstName ?? user.FirstName;
            user.LastName = userDTO.LastName ?? user.LastName;
            user.Address = userDTO.Address ?? user.Address;
            user.City = userDTO.City ?? user.City;
            user.PostalCode = userDTO.PostalCode ?? user.PostalCode;
            user.PhoneNumber = userDTO.PhoneNumber ?? user.PhoneNumber;

            var result = await _userManager.UpdateAsync(user);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return NoContent();
        }

        [HttpPut("change-password")]
        [Authorize]

        public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordDTO model)
        {
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
                return NotFound();

            var result = await _userManager.ChangePasswordAsync(user, model.OldPassword, model.NewPassword);

            if (!result.Succeeded)
                return BadRequest(result.Errors);

            return Ok(new { Message = "Password changed successfully" });
        }
    }
}
