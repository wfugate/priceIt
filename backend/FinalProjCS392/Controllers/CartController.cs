//using FinalProjCS392.Models;
//using FinalProjCS392.Services;
//using Microsoft.AspNetCore.Mvc;
//// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860
//namespace FinalProjCS392.Controllers
//{
//    // Controllers/CartController.cs
//    [ApiController]
//    [Route("api/cart")]
//    public class CartController : ControllerBase
//    {
//        private readonly CartService _cartService;
//        public CartController(CartService cartService)
//        {
//            _cartService = cartService;
//        }

//        // Original endpoint
//        [HttpPost("add")]
//        public async Task<IActionResult> AddToCart([FromBody] AddToCartRequest request)
//        {
//            Console.WriteLine("Endpoint hit!");
//            await _cartService.AddProductsToCart(request.UserId, request.Products);
//            return Ok(new { success = true });
//        }

//        // GET /api/cart?userId=123 - Returns all carts for a user
//        [HttpGet]
//        public async Task<IActionResult> GetCart([FromQuery] string userId)
//        {
//            if (string.IsNullOrEmpty(userId))
//            {
//                return BadRequest("User ID is required");
//            }

//            try
//            {
//                var cart = await _cartService.GetOrCreateCart(userId);
//                return Ok(cart);
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, $"Internal server error: {ex.Message}");
//            }
//        }

//        // POST /api/cart - Creates a new empty cart for a user
//        [HttpPost]
//        public async Task<IActionResult> CreateCart([FromBody] AddToCartRequest request)
//        {
//            if (string.IsNullOrEmpty(request.UserId))
//            {
//                return BadRequest("User ID is required");
//            }

//            try
//            {
//                var cart = await _cartService.GetOrCreateCart(request.UserId);
//                return CreatedAtAction(nameof(GetCart), new { userId = request.UserId }, cart);
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, $"Internal server error: {ex.Message}");
//            }
//        }

//        // PUT /api/cart/:cartId - Adds products to a specific cart
//        [HttpPut("{cartId}")]
//        public async Task<IActionResult> UpdateCart(string cartId, [FromBody] AddToCartRequest request)
//        {
//            if (string.IsNullOrEmpty(request.UserId))
//            {
//                return BadRequest("User ID is required");
//            }

//            try
//            {
//                await _cartService.AddProductsToCart(request.UserId, request.Products);
//                return NoContent();
//            }
//            catch (Exception ex)
//            {
//                return StatusCode(500, $"Internal server error: {ex.Message}");
//            }
//        }
//    }

//    public class AddToCartRequest
//    {
//        public string UserId { get; set; }
//        public List<Product> Products { get; set; }
//    }
//}


using FinalProjCS392.Models;
using FinalProjCS392.Services;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace FinalProjCS392.Controllers
{
    [ApiController]
    [Route("api/cart")]
    public class CartController : ControllerBase
    {
        private readonly CartService _cartService;

        public CartController(CartService cartService)
        {
            _cartService = cartService;
        }

        // GET /api/cart?userId={userId} - Returns all carts for a user
        // Matches getUserCarts in TypeScript
        [HttpGet]
        public async Task<IActionResult> GetUserCarts([FromQuery] string userId)
        {
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest("User ID is required");
            }

            try
            {
                var carts = await _cartService.GetUserCarts(userId);
                return Ok(carts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST /api/cart - Creates a new cart for a user
        // Matches createNewUserCart in TypeScript
        [HttpPost]
        public async Task<IActionResult> CreateNewUserCart([FromBody] CreateCartRequest request)
        {
            if (string.IsNullOrEmpty(request.UserId))
            {
                return BadRequest("User ID is required");
            }

            try
            {
                var cart = await _cartService.CreateNewUserCart(request.UserId, request.Name);
                return CreatedAtAction(nameof(GetUserCarts), new { userId = request.UserId }, cart);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // PUT /api/cart/add/{cartId} - Adds products to a specific cart
        // Matches saveToCart in TypeScript
        [HttpPut("add/{cartId}")]
        public async Task<IActionResult> SaveToCart(string cartId, [FromBody] AddToCartRequest request)
        {
            if (string.IsNullOrEmpty(request.UserId))
            {
                return BadRequest("User ID is required");
            }

            try
            {
                var cart = await _cartService.AddProductsToCart(request.UserId, cartId, request.Products);
                return Ok(cart);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }

    public class CreateCartRequest
    {
        public string UserId { get; set; }
        public string Name { get; set; }
    }

    public class AddToCartRequest
    {
        public string UserId { get; set; }
        public List<CartProduct> Products { get; set; }
    }
}