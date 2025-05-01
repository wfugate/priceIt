using MongoDB.Bson;
using MongoDB.Driver;
using Microsoft.AspNetCore.Mvc;
using FinalProjCS392.Services;
using FinalProjCS392.Models;

namespace FinalProjCS392.Controllers
{
    [ApiController]
    [Route("api/images")]

    public class ImageController : ControllerBase
    {
        private readonly IMongoCollection<BsonDocument> _users;
        private readonly UserService _userService;
        private readonly ImageService _imageService;
        public ImageController(ImageService imageService)
        {
            //initialize image service through dependency injection
            _imageService = imageService;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadImage([FromForm] IFormFile image, [FromForm] string userId)
        {
            //1. validate user id
            if (string.IsNullOrEmpty(userId))
                return BadRequest("Missing user ID.");

            //2. validate image file
            if (image == null || image.Length == 0)
                return BadRequest("No image uploaded.");

            //3. save the image to the database
            var imageId = await _imageService.SaveImage(image.OpenReadStream(), image.FileName);

            //4. save the image reference to the user profile
            var success = await _imageService.SaveImageRef(userId, imageId);

            //5. check if the operation was successful
            if (!success)
                return StatusCode(500, "Failed to save image reference.");

            //6. return success message
            return Ok(new { message = "Image uploaded successfully.", imageId });
        }

        [HttpGet("profile-image/{userId}")]
        public async Task<IActionResult> GetProfileImage(string userId)
        {
            //1. get the image id for the user
            var imageId = await _imageService.GetImageId(userId);

            //2. check if image id was found
            if (imageId == null)
                return NotFound("Profile image not found.");

            //3. get the image bytes using the image id
            var imageBytes = await _imageService.GetImage(imageId.Value);

            //4. check if image bytes were found
            if (imageBytes == null)
                return NotFound("Profile image not found.");

            //5. return the image as a byte array with proper content type
            return File(imageBytes, "image/jpeg");
        }
    }
}