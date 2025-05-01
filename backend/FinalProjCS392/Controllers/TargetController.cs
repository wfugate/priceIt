using Microsoft.AspNetCore.Mvc;
using System;
using System.Threading.Tasks;
using UnwrangleTargetDemo;

namespace UnwrangleTargetDemo.Controllers
{
    [ApiController]
    [Route("api/[controller]", Name = "Target")]
    public class TargetController : ControllerBase
    {
        private readonly TargetWebScraperService _scraper;

        public TargetController()
        {
            //initialize target web scraper service
            _scraper = new TargetWebScraperService();
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search(string query)
        {
            //1. validate input
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest("Query parameter is required.");

            try
            {
                //2. search for products on target
                var results = await _scraper.SearchProductsAsync(query);

                //3. check if any products were found
                if (results.Count == 0)
                    return NotFound($"No products found for \"{query}\".");

                //4. transform the results to match the expected format
                var formattedResults = results.Select(r => new
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
                //6. handle any errors
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }
    }
}