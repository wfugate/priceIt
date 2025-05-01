using Microsoft.Extensions.Configuration;
using MongoDB.Driver;
using Microsoft.Extensions.Options;
using FinalProjCS392.Models;
using MongoDB.Bson;
using FinalProjCS392.HelperMethods;
using System.Net.Mail;

namespace FinalProjCS392.Services
{
    public class UserService
    {
        private readonly IMongoCollection<User> _users;

        public UserService(IOptions<MongoDbSettings> settings)
        {
            //1. initialize mongodb connection from settings
            var client = new MongoClient(settings.Value.ConnectionString);
            var database = client.GetDatabase(settings.Value.DB_Name);

            //2. get the users collection
            _users = database.GetCollection<User>(settings.Value.UsersCollection);
        }

        public async Task<User?> GetUserByEmail(string email)
        {
            //1. find the first user with matching email
            return await _users.Find(u => u.Email == email).FirstOrDefaultAsync();
        }

        public async Task<User?> AuthenticateUser(string email, string password)
        {
            //1. get user by email
            var user = await GetUserByEmail(email);
            if (user == null) return null;

            //2. verify password using the helper method
            bool isValid = PasswordHelper.VerifyPassword(password, user.PasswordHash, user.Salt);

            //3. return user if valid, otherwise null
            return isValid ? user : null;
        }

        public async Task<(bool Success, string? Message, User? User)> RegisterUser(string email, string password)
        {
            //1. check if user with this email already exists
            var existingUser = await GetUserByEmail(email);
            if (existingUser != null)
            {
                return (false, "Email is already registered.", null);
            }

            //2. hash the password
            var (hash, salt) = PasswordHelper.HashPassword(password);

            //3. create new user with hashed password
            var newUser = new User
            {
                Id = ObjectId.GenerateNewId().ToString(), // explicitly generate ID
                Email = email,
                PasswordHash = hash,
                Salt = salt
            };

            //4. insert user into database
            await _users.InsertOneAsync(newUser);

            //5. return success with the new user
            return (true, null, newUser);
        }

        public async Task<UpdateResult> UpdateUserAsync(string id, UpdateDefinition<User> update)
        {
            //1. update user by id with the provided update definition
            return await _users.UpdateOneAsync(u => u.Id == id, update);
        }

        public async Task<DeleteResult> DeleteUser(string userId)
        {
            //1. create filter for the user id
            var filter = Builders<User>.Filter.Eq(u => u.Id, userId);

            //2. delete the user matching the filter
            return await _users.DeleteOneAsync(filter);
        }

        public async Task<bool> ValidateEmail(string email)
        {
            try
            {
                //1. attempt to create a mail address object to validate format
                var mailAddress = new MailAddress(email);
                return true;
            }
            catch (FormatException)
            {
                //2. return false if format is invalid
                return false;
            }
        }
    }
}