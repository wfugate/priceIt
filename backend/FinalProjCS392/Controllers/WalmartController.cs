using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Threading.Tasks;
using FinalProjCS392.Services;

namespace FinalProjCS392.Controllers
{
    [Route("api/[controller]", Name = "Walmart")]
    [ApiController]
    public class WalmartController : ControllerBase
    {
        private readonly WalmartScraperService _walmartScraperService;

        public WalmartController(WalmartScraperService walmartScraperService)
        {
            _walmartScraperService = walmartScraperService;
        }

        // GET api/walmart/search?query=apple
        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string query)
        {
            if (string.IsNullOrEmpty(query))
            {
                return BadRequest("Query parameter is required.");
            }

            try
            {
                var products = await _walmartScraperService.SearchProductsAsync(query);

                if (products.Count == 0)
                {
                    return NotFound("No products found.");
                }

                // Transform the results to match the expected format
                var formattedResults = products.Select(r => new
                {
                    name = r.Name,
                    brand = r.Brand,
                    price = r.Price,
                    thumbnail = r.Thumbnail
                });

                return Ok(formattedResults);
            }
            catch (Exception ex)
            {
                // Log the full exception
                Console.WriteLine($"Error in WalmartController: {ex}");
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }
    }
}