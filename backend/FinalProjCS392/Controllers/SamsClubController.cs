using Microsoft.AspNetCore.Mvc;
using System;
using System.Linq;
using System.Threading.Tasks;
using FinalProjCS392.Services;

namespace FinalProjCS392.Controllers
{
    [ApiController]
    [Route("api/[controller]", Name = "SamsClub")]
    public class SamsClubController : ControllerBase
    {
        private readonly SamsClubScraperService _scraper;

        public SamsClubController(SamsClubScraperService scraper)
        {
            //initialize sam's club scraper service through dependency injection
            _scraper = scraper;
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search(string query)
        {
            //1. validate input
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest("Query parameter is required.");

            try
            {
                //2. search for products on sam's club
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
                //6. log and handle any errors
                Console.WriteLine($"Error in SamsClubController: {ex}");
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }
    }
}