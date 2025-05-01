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
        private readonly CartService _cartService;

        public AuthController(UserService userService, ImageService imageService, CartService cartService)
        {
            //initialize services through dependency injection
            _userService = userService;
            _imageService = imageService;
            _cartService = cartService;
        }

        // POST: /auth/signup
        [HttpPost("signup")]
        public async Task<IActionResult> SignUp([FromBody] AuthRequest request)
        {
            //1. validate email format
            var validEmail = await _userService.ValidateEmail(request.Email);

            if (!validEmail)
            {
                return BadRequest(new { message = "The email is not in valid format" });
            }

            //2. validate password length - minimum 6 characters
            if (request.Password.Length < 6)
            {
                return BadRequest(new { message = "Password length is Too Small.\nPlease use at least 6 charaters" });
            }

            //3. validate password length - maximum 12 characters
            if (request.Password.Length > 12)
            {
                return BadRequest(new { message = "Password length is Too Long.\nPlease use less than 12 charaters" });
            }

            //4. attempt to register the user
            var (success, message, user) = await _userService.RegisterUser(request.Email, request.Password);

            //5. return error if registration failed
            if (!success)
                return BadRequest(new { message });

            //6. return the user data if successful
            return Ok(user);
        }

        // POST: /auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] AuthRequest request)
        {
            //1. attempt to authenticate the user
            var user = await _userService.AuthenticateUser(request.Email, request.Password);

            //2. return error if authentication failed
            if (user == null)
                return Unauthorized(new { message = "Invalid email or password" });

            //3. prepare safe user data (without password)
            retrunUser safeData = new retrunUser();
            safeData.Email = user.Email;
            safeData.Age = user.Age;
            safeData.Id = user.Id;
            safeData.Name = user.Name;
            //safeData.ProfileImageId = user.ProfileImageId;

            //4. return the safe user data
            return Ok(safeData);
        }

        // POST: /auth/update-profile
        [HttpPost("update-profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileRequest request)
        {
            //1. find the user by email
            var user = await _userService.GetUserByEmail(request.Email);

            //2. return error if user not found
            if (user == null)
                return NotFound("User not found");

            //3. prepare update operation for user profile data
            var update = Builders<User>.Update
               .Set(u => u.Name, request.Name)
               .Set(u => u.Age, request.Age);

            //4. update the user profile
            var result = await _userService.UpdateUserAsync(user.Id, update);

            //5. return success message
            return Ok("Profile updated");
        }

        // DELETE: /auth/delete/{id}
        [HttpDelete("delete/{id}")]
        public async Task<IActionResult> DeleteUser(string id)
        {
            //1. delete all user's carts
            await _cartService.DeleteAllUserCart(id);

            //2. delete user's profile image
            await _imageService.DeleteImage(id);

            //3. delete the user account
            var result = await _userService.DeleteUser(id);

            //4. return error if user not found
            if (result.DeletedCount == 0)
            {
                return NotFound("User not found");
            }

            //5. return success message
            return Ok("User deleted");

        }
    }
}