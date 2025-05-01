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
            //initialize walmart scraper service through dependency injection
            _walmartScraperService = walmartScraperService;
        }

        // GET api/walmart/search?query=apple
        [HttpGet("search")]
        public async Task<IActionResult> Search([FromQuery] string query)
        {
            //1. validate input
            if (string.IsNullOrEmpty(query))
            {
                return BadRequest("Query parameter is required.");
            }

            try
            {
                //2. search for products on walmart
                var products = await _walmartScraperService.SearchProductsAsync(query);

                //3. check if any products were found
                if (products.Count == 0)
                {
                    return NotFound("No products found.");
                }

                //4. transform the results to match the expected format
                var formattedResults = products.Select(r => new
                {
                    name = r.Name,
                    brand = r.Brand,
                    price = r.Price,
                    thumbnail = r.Thumbnail,
                    productUrl = r.ProductUrl
                });

                //5. return formatted results
                return Ok(formattedResults);
            }
            catch (Exception ex)
            {
                //6. log and handle any errors
                Console.WriteLine($"Error in WalmartController: {ex}");
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }
    }
}