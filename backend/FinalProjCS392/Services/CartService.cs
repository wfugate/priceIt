using FinalProjCS392.Models;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using System;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace FinalProjCS392.Services
{
    public class CartService
    {
        private readonly IMongoCollection<Cart> _carts;

        public CartService(IOptions<MongoDbSettings> settings)
        {
            var client = new MongoClient(settings.Value.ConnectionString);
            var database = client.GetDatabase(settings.Value.DB_Name);
            _carts = database.GetCollection<Cart>("Carts");
        }

        // Get user carts (matching the getUserCarts TypeScript function)
        public async Task<List<Cart>> GetUserCarts(string userId)
        {
            
            var carts = await _carts.Find(c => c.UserId == userId).ToListAsync();
            Console.WriteLine($"Found {carts.Count} Carts Associated With {userId}");
            return carts ?? new List<Cart>();
        }

        //Get carts by cartId (used for emailing cart in email service)
        public async Task<List<Cart>> GetCartsByIds(string userId, List<string> cartIds)
        {
            var filter = Builders<Cart>.Filter.And(
                Builders<Cart>.Filter.Eq(c => c.UserId, userId),
                Builders<Cart>.Filter.In(c => c.Id, cartIds)
            );

            return await _carts.Find(filter).ToListAsync();
        }

        // Create new cart (matching the createNewUserCart TypeScript function)
        public async Task<Cart> CreateNewUserCart(string userId, string name)
        {
            var cart = new Cart
            {
                UserId = userId,
                Name = name,
                Products = new List<CartProduct>(),
                CreatedAt = DateTime.UtcNow.ToString()
            };

            await _carts.InsertOneAsync(cart);
            return cart;
        }

        // Add products to cart (matching the saveToCart TypeScript function)
        public async Task<Cart> AddProductsToCart(string userId, string cartId, List<CartProduct> products)
        {
            var filter = Builders<Cart>.Filter.And(
                Builders<Cart>.Filter.Eq(c => c.UserId, userId),
                Builders<Cart>.Filter.Eq(c => c.Id, cartId)
            );

            // Ensure all products have store information
            foreach (var product in products)
            {
                if (string.IsNullOrEmpty(product.Store))
                {
                    product.Store = "Unknown Store";
                }
            }

            // Add each product to the cart's products array
            var update = Builders<Cart>.Update
                .PushEach(c => c.Products, products);

            var result = await _carts.FindOneAndUpdateAsync(
                filter,
                update,
                new FindOneAndUpdateOptions<Cart> { ReturnDocument = ReturnDocument.After }
            );

            if (result == null)
            {
                throw new Exception("Cart not found or user doesn't have access");
            }

            return result;
        }

        // Update the UpdateCartProducts method to ensure store property is preserved
        public async Task<Cart> UpdateCartProducts(string userId, string cartId, List<CartProduct> products)
        {
            var filter = Builders<Cart>.Filter.And(
                Builders<Cart>.Filter.Eq(c => c.UserId, userId),
                Builders<Cart>.Filter.Eq(c => c.Id, cartId)
            );

            // Ensure all products have store information
            foreach (var product in products)
            {
                if (string.IsNullOrEmpty(product.Store))
                {
                    product.Store = "Unknown Store";
                }
            }

            // Replace the products array
            var update = Builders<Cart>.Update
                .Set(c => c.Products, products);

            var result = await _carts.FindOneAndUpdateAsync(
                filter,
                update,
                new FindOneAndUpdateOptions<Cart> { ReturnDocument = ReturnDocument.After }
            );

            if (result == null)
            {
                throw new Exception("Cart not found or user doesn't have access");
            }

            return result;
        }

        // Update the UpdateCart method to ensure store property is preserved
        public async Task<Cart> UpdateCart(Cart cart)
        {
            var filter = Builders<Cart>.Filter.And(
                Builders<Cart>.Filter.Eq(c => c.UserId, cart.UserId),
                Builders<Cart>.Filter.Eq(c => c.Id, cart.Id)
            );
            Console.WriteLine("Attempting to update cart..........");
            // Ensure all products have store information
            foreach (var product in cart.Products)
            {
                if (string.IsNullOrEmpty(product.Store))
                {
                    product.Store = "Unknown Store";
                }
            }

            var update = Builders<Cart>.Update
                .Set(c => c.Products, cart.Products)
                .Set(c => c.Name, cart.Name);

            Console.WriteLine("2x Attempting to update cart..........");
            var result = await _carts.FindOneAndUpdateAsync(
                filter,
                update,
                new FindOneAndUpdateOptions<Cart> { ReturnDocument = ReturnDocument.After }
            );

            if (result == null)
            {
                throw new Exception("Cart not found or user doesn't have access");
            }

            return result;
        }
        // Update cart products (replaces existing products)

        // Delete a cart
        public async Task<bool> DeleteCart(string userId, string cartId)
        {
            var filter = Builders<Cart>.Filter.And(
                Builders<Cart>.Filter.Eq(c => c.UserId, userId),
                Builders<Cart>.Filter.Eq(c => c.Id, cartId)
            );

            var result = await _carts.DeleteOneAsync(filter);
            return result.DeletedCount > 0;
        }

        // Remove product from cart
        public async Task<Cart> RemoveProductFromCart(string userId, string cartId, string productId)
        {
            var filter = Builders<Cart>.Filter.And(
                Builders<Cart>.Filter.Eq(c => c.UserId, userId),
                Builders<Cart>.Filter.Eq(c => c.Id, cartId)
            );

            // Remove the product from the cart's products array
            // This will match products with either id or productId field matching the provided productId
            var update = Builders<Cart>.Update
                .PullFilter(c => c.Products, p => p.ProductId == productId || p.ProductId == productId);

            var result = await _carts.FindOneAndUpdateAsync(
                filter,
                update,
                new FindOneAndUpdateOptions<Cart> { ReturnDocument = ReturnDocument.After }
            );

            if (result == null)
            {
                throw new Exception("Cart not found or user doesn't have access");
            }

            return result;
        }

        public async Task DeleteAllUserCart(string userId) {
            var allUserCarts = Builders<Cart>.Filter.Eq(c => c.UserId, userId);

            await _carts.DeleteOneAsync(allUserCarts);
        }

    }
}