
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;

namespace FinalProjCS392.Models
{
    public class User
    {
        [BsonId]
        [BsonRepresentation(BsonType.ObjectId)] // Ensures it’s serialized as a string in JSON
        public string Id { get; set; }

        [BsonElement("email")]
        public string Email { get; set; }

        [BsonElement("passwordHash")]
        public string PasswordHash { get; set; }

        [BsonElement("salt")]
        public string Salt { get; set; }

        [BsonElement("name")]
        public string? Name { get; set; }

        [BsonElement("age")]
        public int? Age { get; set; }

        public ObjectId? ProfileImageId { get; set; }
    }

    public class retrunUser
    {
        public string Id { get; set; }
        public string Email { get; set; }
        public string? Name { get; set; }
        public int? Age { get; set; }
        public ObjectId? ProfileImageId { get; set; }


    }
}