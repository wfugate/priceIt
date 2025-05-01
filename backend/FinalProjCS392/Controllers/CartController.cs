using FinalProjCS392.Models;
using FinalProjCS392.Services;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;
using static Google.Cloud.Vision.V1.ProductSearchResults.Types;

namespace FinalProjCS392.Controllers
{
    [ApiController]
    [Route("api/cart")]
    public class CartController : ControllerBase
    {
        private readonly CartService _cartService;
        public static int count = 0;
        public CartController(CartService cartService)
        {
            //initialize cart service through dependency injection
            _cartService = cartService;
        }

        // GET /api/cart?userId={userId} - Returns all carts for a user
        // Matches getUserCarts in TypeScript
        [HttpGet]
        public async Task<IActionResult> GetUserCarts([FromQuery] string userId)
        {
            //1. debug logging
            Console.WriteLine($"X{count + 1}GetUserCarts Tiggered");

            //2. validate input
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest("User ID is required");
            }

            try
            {
                //3. log process stages
                Console.WriteLine("Sarting GetUserCarts");

                //4. get all carts for the user
                var carts = await _cartService.GetUserCarts(userId);

                //5. log success
                Console.WriteLine("Passes GetUserCarts");

                //6. return carts to client
                return Ok(carts);
            }
            catch (Exception ex)
            {
                //7. log error and return error status
                Console.WriteLine("Fails GetUserCarts");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST /api/cart - Creates a new cart for a user
        // Matches createNewUserCart in TypeScript
        [HttpPost]
        public async Task<IActionResult> CreateNewUserCart([FromBody] CreateCartRequest request)
        {
            //1. log request with counter
            Console.WriteLine($"X{count + 1} CreateNewUserCart Tiggered");
            Console.WriteLine("CreateNew Tiggered");

            //2. validate input
            if (string.IsNullOrEmpty(request.UserId))
            {
                return BadRequest("User ID is required");
            }

            try
            {
                //3. create new cart for user with specified name
                var cart = await _cartService.CreateNewUserCart(request.UserId, request.Name);

                //4. return created cart with location header
                return CreatedAtAction(nameof(GetUserCarts), new { userId = request.UserId }, cart);
            }
            catch (Exception ex)
            {
                //5. handle any errors
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // PUT /api/cart/add/{cartId} - Adds products to a specific cart
        // Matches saveToCart in TypeScript
        [HttpPut("add/{cartId}")]
        public async Task<IActionResult> SaveToCart(string cartId, [FromBody] AddToCartRequest request)
        {
            //1. log request with counter
            Console.WriteLine($"X{count + 1} SaveToCart Tiggered");

            //2. validate input
            if (string.IsNullOrEmpty(request.UserId))
            {
                return BadRequest("User ID is required");
            }

            try
            {
                //3. add products to the specified cart
                var cart = await _cartService.AddProductsToCart(request.UserId, cartId, request.Products);

                //4. return updated cart
                return Ok(cart);
            }
            catch (Exception ex)
            {
                //5. handle any errors
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // DELETE /api/cart/{cartId} - Deletes a specific cart
        [HttpDelete("{cartId}")]
        public async Task<IActionResult> DeleteCart(string cartId, [FromQuery] string userId)
        {
            //1. log request with counter
            Console.WriteLine($"X{count + 1} DeleteCart Tiggered");

            //2. validate input
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest("User ID is required");
            }

            try
            {
                //3. delete the cart
                var result = await _cartService.DeleteCart(userId, cartId);

                //4. return appropriate response based on result
                if (result)
                {
                    return NoContent();
                }
                return NotFound("Cart not found or user doesn't have access");
            }
            catch (Exception ex)
            {
                //5. handle any errors
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // DELETE /api/cart/{cartId}/products/{productId} - Removes a specific product from a cart
        [HttpDelete("{cartId}/products/{productId}")]
        public async Task<IActionResult> RemoveProductFromCart(string cartId, string productId, [FromQuery] string userId)
        {
            //1. log request with counter
            Console.WriteLine($"X{count + 1} RemoveProductFromCart Tiggered");

            //2. validate input
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest("User ID is required");
            }

            try
            {
                //3. log operation start
                Console.WriteLine("Triggered RemoveProductFromCart");

                //4. remove product from cart
                var cart = await _cartService.RemoveProductFromCart(userId, cartId, productId);

                //5. return updated cart
                return Ok(cart);
            }
            catch (Exception ex)
            {
                //6. handle any errors
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // PUT /api/cart/{cartId} - Updates an existing cart
        [HttpPut("{cartId}")]
        public async Task<IActionResult> UpdateCart(string cartId, [FromBody] UpdateCartRequest request)
        {
            //1. log request with counter
            Console.WriteLine($"X{count + 1} UpdateCart Tiggered");
            Console.WriteLine("Controller for update cart triggered");

            //2. validate input
            if (string.IsNullOrEmpty(request.UserId))
            {
                return BadRequest("User ID is required");
            }

            try
            {
                //3. verify the cart exists and belongs to the user
                var existingCarts = await _cartService.GetUserCarts(request.UserId);
                var cart = existingCarts.FirstOrDefault(c => c.Id == cartId);

                if (cart == null)
                {
                    return NotFound($"Cart with ID {cartId} not found for this user");
                }

                //4. log progress
                Console.WriteLine("Here");

                //5. update the cart with new products
                cart.Products = request.Products;

                //// If a new name was provided, update it
                //if (!string.IsNullOrEmpty(request.Name))
                //{
                //    cart.Name = request.Name;
                //}

                //6. save the updated cart
                var updatedCart = await _cartService.UpdateCart(cart);

                //7. return updated cart
                return Ok(updatedCart);
            }
            catch (Exception ex)
            {
                //8. handle any errors
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

    public class UpdateCartRequest
    {
        public string UserId { get; set; }
        public string Name { get; set; }
        public List<CartProduct> Products { get; set; }

    }
}