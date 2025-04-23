//using MongoDB.Bson.Serialization.Attributes;
//using MongoDB.Bson;

//namespace FinalProjCS392.Models
//{
//    // Models/Product.cs
//    public class Product
//    {
//        [BsonElement("productId")]
//        public string ProductId { get; set; }

//        [BsonElement("thumbnail")]
//        public string Thumbnail { get; set; }

//        [BsonElement("price")]
//        public decimal Price { get; set; }

//        [BsonElement("name")]
//        public string Name { get; set; }

//        [BsonElement("brand")]
//        public string Brand { get; set; }

//        [BsonElement("quantity")]
//        public int Quantity { get; set; } = 1;
//    }

//    // Models/Cart.cs
//    public class Cart
//    {
//        [BsonId]
//        [BsonRepresentation(BsonType.ObjectId)]
//        public string Id { get; set; }

//        [BsonElement("userId")]
//        public string UserId { get; set; } // Or sessionId for guest carts

//        [BsonElement("products")]
//        public List<Product> Products { get; set; } = new List<Product>();

//        [BsonElement("createdAt")]
//        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

//        [BsonElement("updatedAt")]
//        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
//    }
//}

using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using System.Collections.Generic;

namespace FinalProjCS392.Models
{
    public class Cart
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)]
        public string Id { get; set; }

        public string Name { get; set; }

        public string UserId { get; set; }

        public List<CartProduct> Products { get; set; } = new List<CartProduct>();

        public string CreatedAt { get; set; }
    }

    public class CartProduct
    {
        public string ProductId { get; set; }

        public string Thumbnail { get; set; }

        public double Price { get; set; }

        public string Name { get; set; }

        public string Brand { get; set; }

        public int Quantity { get; set; } = 1;
    }

    // For completeness, though we may not use it directly in the refactored code
    public class Product
    {
        public string Id { get; set; }

        public string Thumbnail { get; set; }

        public double Price { get; set; }

        public string Name { get; set; }

        public string Brand { get; set; }
    }
}
