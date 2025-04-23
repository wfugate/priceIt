using Microsoft.Extensions.Configuration;
using MongoDB.Driver;
using Microsoft.Extensions.Options;
using FinalProjCS392.Models;
using MongoDB.Bson;
using FinalProjCS392.HelperMethods;

namespace FinalProjCS392.Services
{
    public class UserService
    {
        private readonly IMongoCollection<User> _users;

        public UserService(IOptions<MongoDbSettings> settings)
        {
            var client = new MongoClient(settings.Value.ConnectionString);
            var database = client.GetDatabase(settings.Value.DB_Name);
            _users = database.GetCollection<User>(settings.Value.UsersCollection);
        }

        public async Task<User?> GetUserByEmail(string email)
        {
            return await _users.Find(u => u.Email == email).FirstOrDefaultAsync();
        }

        public async Task<User?> AuthenticateUser(string email, string password)
        {
            var user = await GetUserByEmail(email);
            if (user == null) return null;

            bool isValid = PasswordHelper.VerifyPassword(password, user.PasswordHash, user.Salt);
            return isValid ? user : null;
        }

        public async Task<(bool Success, string? Message, User? User)> RegisterUser(string email, string password)
        {
            var existingUser = await GetUserByEmail(email);
            if (existingUser != null)
            {
                return (false, "Email is already registered.", null);
            }

            var (hash, salt) = PasswordHelper.HashPassword(password);
            var newUser = new User
            {
                Id = ObjectId.GenerateNewId().ToString(), // Explicitly generate ID
                Email = email,
                PasswordHash = hash,
                Salt = salt
            };

            await _users.InsertOneAsync(newUser);
            return (true, null, newUser);
        }

        public async Task<UpdateResult> UpdateUserAsync(string id, UpdateDefinition<User> update)
        {
            return await _users.UpdateOneAsync(u => u.Id == id, update);
        }

        public async Task<DeleteResult> DeleteUser(string userId)
        {
            var filter = Builders<User>.Filter.Eq(u => u.Id, userId);
            return await _users.DeleteOneAsync(filter);
        }
    }

}