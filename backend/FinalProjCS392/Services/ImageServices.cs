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
            //1. initialize mongodb connection from settings
            var client = new MongoClient(settings.Value.ConnectionString);
            var database = client.GetDatabase(settings.Value.DB_Name);

            //2. initialize database and collections
            _database = database;
            _users = database.GetCollection<User>(settings.Value.UsersCollection);

            //3. initialize gridfs bucket for file storage
            _gridFsBucket = new GridFSBucket(_database);
        }

        public async Task<ObjectId> SaveImage(Stream imageStream, string filename)
        {
            //1. upload the image to gridfs
            var imageId = await _gridFsBucket.UploadFromStreamAsync(filename, imageStream);

            //2. return the generated image id
            return imageId;
        }

        public async Task<bool> SaveImageRef(string userId, ObjectId imageId)
        {
            //1. find the user by id
            var user = await _users.Find(u => u.Id == userId).FirstOrDefaultAsync();

            //2. if the user has an existing image, delete it first
            if (user != null && user.ProfileImageId != null)
            {
                try
                {
                    //delete old image
                    await _gridFsBucket.DeleteAsync(user.ProfileImageId.Value);
                }
                catch (GridFSFileNotFoundException)
                {
                    //already deleted or never existed — ignore
                }
            }

            //3. update or create user with new profile image
            var filter = Builders<User>.Filter.Eq(u => u.Id, userId);
            var update = Builders<User>.Update.Set(u => u.ProfileImageId, imageId);
            var options = new UpdateOptions { IsUpsert = true };

            //4. perform the update and check results
            var result = await _users.UpdateOneAsync(filter, update, options);
            return result.ModifiedCount > 0 || result.UpsertedId != null;
        }

        public async Task<byte[]?> GetImage(ObjectId imageId)
        {
            try
            {
                //1. create memory stream to hold the image data
                using var stream = new MemoryStream();

                //2. download the image from gridfs to the stream
                await _gridFsBucket.DownloadToStreamAsync(imageId, stream);

                //3. convert the stream to byte array and return
                return stream.ToArray();
            }
            catch (GridFSFileNotFoundException)
            {
                //4. return null if image not found
                return null;
            }
        }

        public async Task<ObjectId?> GetImageId(string userId)
        {
            //1. find the user by id
            var user = await _users.Find(u => u.Id == userId).FirstOrDefaultAsync();

            //2. return the user's profile image id
            return user?.ProfileImageId;
        }

        public async Task<bool> DeleteImage(string userId)
        {
            //1. find the user by id
            var user = await _users.Find(u => u.Id == userId).FirstOrDefaultAsync();

            //2. check if user has a profile image
            if (user?.ProfileImageId == null)
                return false;

            try
            {
                //3. delete the image from gridfs
                await _gridFsBucket.DeleteAsync(user.ProfileImageId.Value);

                //4. remove the image reference from the user
                var update = Builders<User>.Update.Unset(u => u.ProfileImageId);
                await _users.UpdateOneAsync(u => u.Id == userId, update);

                //5. return success
                return true;
            }
            catch (GridFSFileNotFoundException)
            {
                //6. file already gone
                return false;
            }
        }
    }
}