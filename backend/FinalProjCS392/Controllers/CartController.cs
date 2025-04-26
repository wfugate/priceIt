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

        // DELETE /api/cart/{cartId} - Deletes a specific cart
        [HttpDelete("{cartId}")]
        public async Task<IActionResult> DeleteCart(string cartId, [FromQuery] string userId)
        {
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest("User ID is required");
            }

            try
            {
                var result = await _cartService.DeleteCart(userId, cartId);
                if (result)
                {
                    return NoContent();
                }
                return NotFound("Cart not found or user doesn't have access");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // DELETE /api/cart/{cartId}/products/{productId} - Removes a specific product from a cart
        [HttpDelete("{cartId}/products/{productId}")]
        public async Task<IActionResult> RemoveProductFromCart(string cartId, string productId, [FromQuery] string userId)
        {
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest("User ID is required");
            }

            try
            {
                var cart = await _cartService.RemoveProductFromCart(userId, cartId, productId);
                return Ok(cart);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // PUT /api/cart/{cartId} - Updates an existing cart
        [HttpPut("{cartId}")]
        public async Task<IActionResult> UpdateCart(string cartId, [FromBody] UpdateCartRequest request)
        {
            if (string.IsNullOrEmpty(request.UserId))
            {
                return BadRequest("User ID is required");
            }

            try
            {
                // Verify the cart exists and belongs to the user
                var existingCarts = await _cartService.GetUserCarts(request.UserId);
                var cart = existingCarts.FirstOrDefault(c => c.Id == cartId);

                if (cart == null)
                {
                    return NotFound($"Cart with ID {cartId} not found for this user");
                }

                // Update the cart with new products
                cart.Products = request.Products;

                //// If a new name was provided, update it
                //if (!string.IsNullOrEmpty(request.Name))
                //{
                //    cart.Name = request.Name;
                //}

                // Save the updated cart
                var updatedCart = await _cartService.UpdateCart(cart);

                return Ok(updatedCart);
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

    public class UpdateCartRequest
    {
        public string UserId { get; set; }
        public string Name { get; set; }
        public List<CartProduct> Products { get; set; }
    }
}