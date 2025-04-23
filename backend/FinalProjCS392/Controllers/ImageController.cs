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
            _imageService = imageService;
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadImage([FromForm] IFormFile image, [FromForm] string userId)
        {
            if (string.IsNullOrEmpty(userId))
                return BadRequest("Missing user ID.");

            if (image == null || image.Length == 0)
                return BadRequest("No image uploaded.");

            var imageId = await _imageService.SaveImage(image.OpenReadStream(), image.FileName);
            var success = await _imageService.SaveImageRef(userId, imageId);

            if (!success)
                return StatusCode(500, "Failed to save image reference.");

            return Ok(new { message = "Image uploaded successfully.", imageId });

        }

        [HttpGet("profile-image/{userId}")]
        public async Task<IActionResult> GetProfileImage(string userId)
        {
            var imageId = await _imageService.GetImageId(userId);
            if (imageId == null)
                return NotFound("Profile image not found.");

            var imageBytes = await _imageService.GetImage(imageId.Value);
            if (imageBytes == null)
                return NotFound("Profile image not found.");

            // Return the image as a byte array with proper content type (e.g., "image/jpeg")
            return File(imageBytes, "image/jpeg");
        }
    }

}

