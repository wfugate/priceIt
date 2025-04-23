using FinalProjCS392.HelperMethods;
using FinalProjCS392.Models;
using MongoDB.Driver;
using Microsoft.AspNetCore.Mvc;
using FinalProjCS392.Services;
using MongoDB.Bson;

namespace FinalProjCS392.Controllers
{
    [ApiController]
    [Route("[controller]")]

    public class AuthController : ControllerBase
    {
        private readonly UserService _userService;
        private readonly ImageService _imageService;

        public AuthController(UserService userService, ImageService imageService)
        {
            _userService = userService;
            _imageService = imageService;
        }

        // POST: /auth/signup
        [HttpPost("signup")]
        public async Task<IActionResult> SignUp([FromBody] AuthRequest request)
        {
            var (success, message, user) = await _userService.RegisterUser(request.Email, request.Password);
            if (!success)
                return BadRequest(new { message });

            return Ok(user);
        }

        // POST: /auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] AuthRequest request)
        {
            var user = await _userService.AuthenticateUser(request.Email, request.Password);
            if (user == null)
                return Unauthorized(new { message = "Invalid email or password" });

            retrunUser safeData = new retrunUser();
            safeData.Email = user.Email;
            safeData.Age = user.Age;    
            safeData.Id = user.Id;
            safeData.Name = user.Name;
            //safeData.ProfileImageId = user.ProfileImageId;

            return Ok(safeData);
        }

        // POST: /auth/update-profile
        [HttpPost("update-profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            var user = await _userService.GetUserByEmail(request.Email);
            if (user == null)
                return NotFound("User not found");

            var update = Builders<User>.Update
                .Set(u => u.Name, request.Name)
                .Set(u => u.Age, request.Age);

            var result = await _userService.UpdateUserAsync(user.Id, update);
            return Ok("Profile updated");
        }

        // DELETE: /auth/delete/{id}
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            await _imageService.DeleteImage(id);

            var result = await _userService.DeleteUser(id);
            if (result.DeletedCount == 0)
                return NotFound("User not found");

            return Ok("User deleted");

        }
    }
}

