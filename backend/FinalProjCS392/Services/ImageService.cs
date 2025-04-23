using FinalProjCS392.Models;
using Microsoft.Extensions.Options;
using MongoDB.Bson;
using MongoDB.Driver;
using MongoDB.Driver.GridFS;

namespace FinalProjCS392.Services
{
    
    public class ImageService
    {
        private readonly IMongoCollection<User> _users;
        private readonly IMongoDatabase _database;
        private readonly GridFSBucket _gridFsBucket;

        public ImageService(IOptions<MongoDbSettings> settings)
        {
            var client = new MongoClient(settings.Value.ConnectionString);
            var database = client.GetDatabase(settings.Value.DB_Name);

            _database = database;
            _users = database.GetCollection<User>(settings.Value.UsersCollection);
            _gridFsBucket = new GridFSBucket(_database);

        }

        public async Task<ObjectId> SaveImage(Stream imageStream, string filename)
        {
            
            var imageId = await _gridFsBucket.UploadFromStreamAsync(filename, imageStream);
            return imageId;
        }

        public async Task<bool> SaveImageRef(string userId, ObjectId imageId)
        {
            var user = await _users.Find(u => u.Id == userId).FirstOrDefaultAsync();

            //If the user has an image saved into the databse, then  
            if (user != null && user.ProfileImageId != null)
            {
                try
                {
                    // Delete old image 
                    await _gridFsBucket.DeleteAsync(user.ProfileImageId.Value);
                }
                catch (GridFSFileNotFoundException)
                {
                    // Already deleted or never existed — ignore
                }
            }

            // Update or create user with new profile image
            var filter = Builders<User>.Filter.Eq(u => u.Id, userId);
            var update = Builders<User>.Update.Set(u => u.ProfileImageId, imageId);
            var options = new UpdateOptions { IsUpsert = true };

            var result = await _users.UpdateOneAsync(filter, update, options);
            return result.ModifiedCount > 0 || result.UpsertedId != null;
        }

        public async Task<byte[]?> GetImage(ObjectId imageId)
        {
            try
            {
                using var stream = new MemoryStream();
                await _gridFsBucket.DownloadToStreamAsync(imageId, stream);
                return stream.ToArray();
            }
            catch (GridFSFileNotFoundException)
            {
                return null;
            }
        }

        public async Task<ObjectId?> GetImageId(string userId)
        {
            var user = await _users.Find(u => u.Id == userId).FirstOrDefaultAsync();
            return user?.ProfileImageId;
        }

        public async Task<bool> DeleteImage(string userId)
        {
            var user = await _users.Find(u => u.Id == userId).FirstOrDefaultAsync();

            if (user?.ProfileImageId == null)
                return false;

            try
            {
                await _gridFsBucket.DeleteAsync(user.ProfileImageId.Value);

                // Also clear the reference in the user document (or delete whole user separately)
                var update = Builders<User>.Update.Unset(u => u.ProfileImageId);
                await _users.UpdateOneAsync(u => u.Id == userId, update);
                return true;
            }
            catch (GridFSFileNotFoundException)
            {
                // File already gone
                return false;
            }
        }

    }

}

