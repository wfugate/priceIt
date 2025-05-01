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
            //1. initialize mongodb connection from settings
            var client = new MongoClient(settings.Value.ConnectionString);
            var database = client.GetDatabase(settings.Value.DB_Name);

            //2. get the carts collection
            _carts = database.GetCollection<Cart>("Carts");
        }

        // Get user carts (matching the getUserCarts TypeScript function)
        public async Task<List<Cart>> GetUserCarts(string userId)
        {
            //1. find all carts belonging to the user
            var carts = await _carts.Find(c => c.UserId == userId).ToListAsync();

            //2. log the number of carts found
            Console.WriteLine($"Found {carts.Count} Carts Associated With {userId}");

            //3. return carts or empty list if none found
            return carts ?? new List<Cart>();
        }

        //Get carts by cartId (used for emailing cart in email service)
        public async Task<List<Cart>> GetCartsByIds(string userId, List<string> cartIds)
        {
            //1. create a filter to match user id and any cart id from the list
            var filter = Builders<Cart>.Filter.And(
                Builders<Cart>.Filter.Eq(c => c.UserId, userId),
                Builders<Cart>.Filter.In(c => c.Id, cartIds)
            );

            //2. find and return matching carts
            return await _carts.Find(filter).ToListAsync();
        }

        // Create new cart (matching the createNewUserCart TypeScript function)
        public async Task<Cart> CreateNewUserCart(string userId, string name)
        {
            //1. create a new cart object
            var cart = new Cart
            {
                UserId = userId,
                Name = name,
                Products = new List<CartProduct>(),
                CreatedAt = DateTime.UtcNow.ToString()
            };

            //2. insert the cart into the database
            await _carts.InsertOneAsync(cart);

            //3. return the new cart
            return cart;
        }

        // Add products to cart (matching the saveToCart TypeScript function)
        public async Task<Cart> AddProductsToCart(string userId, string cartId, List<CartProduct> products)
        {
            //1. create a filter to match user id and cart id
            var filter = Builders<Cart>.Filter.And(
                Builders<Cart>.Filter.Eq(c => c.UserId, userId),
                Builders<Cart>.Filter.Eq(c => c.Id, cartId)
            );

            //2. ensure all products have store information
            foreach (var product in products)
            {
                if (string.IsNullOrEmpty(product.Store))
                {
                    product.Store = "Unknown Store";
                }
            }

            //3. add each product to the cart's products array
            var update = Builders<Cart>.Update
                .PushEach(c => c.Products, products);

            //4. find and update the cart, returning the updated document
            var result = await _carts.FindOneAndUpdateAsync(
                filter,
                update,
                new FindOneAndUpdateOptions<Cart> { ReturnDocument = ReturnDocument.After }
            );

            //5. handle case where cart is not found
            if (result == null)
            {
                throw new Exception("Cart not found or user doesn't have access");
            }

            //6. return the updated cart
            return result;
        }

        // Update the UpdateCartProducts method to ensure store property is preserved
        public async Task<Cart> UpdateCartProducts(string userId, string cartId, List<CartProduct> products)
        {
            //1. create a filter to match user id and cart id
            var filter = Builders<Cart>.Filter.And(
                Builders<Cart>.Filter.Eq(c => c.UserId, userId),
                Builders<Cart>.Filter.Eq(c => c.Id, cartId)
            );

            //2. ensure all products have store information
            foreach (var product in products)
            {
                if (string.IsNullOrEmpty(product.Store))
                {
                    product.Store = "Unknown Store";
                }
            }

            //3. replace the products array
            var update = Builders<Cart>.Update
                .Set(c => c.Products, products);

            //4. find and update the cart, returning the updated document
            var result = await _carts.FindOneAndUpdateAsync(
                filter,
                update,
                new FindOneAndUpdateOptions<Cart> { ReturnDocument = ReturnDocument.After }
            );

            //5. handle case where cart is not found
            if (result == null)
            {
                throw new Exception("Cart not found or user doesn't have access");
            }

            //6. return the updated cart
            return result;
        }

        // Update the UpdateCart method to ensure store property is preserved
        public async Task<Cart> UpdateCart(Cart cart)
        {
            //1. create a filter to match user id and cart id
            var filter = Builders<Cart>.Filter.And(
                Builders<Cart>.Filter.Eq(c => c.UserId, cart.UserId),
                Builders<Cart>.Filter.Eq(c => c.Id, cart.Id)
            );

            //2. log update attempt
            Console.WriteLine("Attempting to update cart..........");

            //3. ensure all products have store information
            foreach (var product in cart.Products)
            {
                if (string.IsNullOrEmpty(product.Store))
                {
                    product.Store = "Unknown Store";
                }
            }

            //4. create update definition for products and name
            var update = Builders<Cart>.Update
                .Set(c => c.Products, cart.Products)
                .Set(c => c.Name, cart.Name);

            //5. log progress
            Console.WriteLine("2x Attempting to update cart..........");

            //6. find and update the cart, returning the updated document
            var result = await _carts.FindOneAndUpdateAsync(
                filter,
                update,
                new FindOneAndUpdateOptions<Cart> { ReturnDocument = ReturnDocument.After }
            );

            //7. handle case where cart is not found
            if (result == null)
            {
                throw new Exception("Cart not found or user doesn't have access");
            }

            //8. return the updated cart
            return result;
        }

        // Delete a cart
        public async Task<bool> DeleteCart(string userId, string cartId)
        {
            //1. create a filter to match user id and cart id
            var filter = Builders<Cart>.Filter.And(
                Builders<Cart>.Filter.Eq(c => c.UserId, userId),
                Builders<Cart>.Filter.Eq(c => c.Id, cartId)
            );

            //2. delete the cart and check if any documents were deleted
            var result = await _carts.DeleteOneAsync(filter);
            return result.DeletedCount > 0;
        }

        // Remove product from cart
        public async Task<Cart> RemoveProductFromCart(string userId, string cartId, string productId)
        {
            //1. create a filter to match user id and cart id
            var filter = Builders<Cart>.Filter.And(
                Builders<Cart>.Filter.Eq(c => c.UserId, userId),
                Builders<Cart>.Filter.Eq(c => c.Id, cartId)
            );

            //2. remove the product from the cart's products array
            // this will match products with either id or productId field matching the provided productId
            var update = Builders<Cart>.Update
                .PullFilter(c => c.Products, p => p.ProductId == productId || p.ProductId == productId);

            //3. find and update the cart, returning the updated document
            var result = await _carts.FindOneAndUpdateAsync(
                filter,
                update,
                new FindOneAndUpdateOptions<Cart> { ReturnDocument = ReturnDocument.After }
            );

            //4. handle case where cart is not found
            if (result == null)
            {
                throw new Exception("Cart not found or user doesn't have access");
            }

            //5. return the updated cart
            return result;
        }

        public async Task DeleteAllUserCart(string userId)
        {
            //1. create a filter to match all carts for the user
            var allUserCarts = Builders<Cart>.Filter.Eq(c => c.UserId, userId);

            //2. delete all matching carts
            await _carts.DeleteOneAsync(allUserCarts);
        }
    }
}