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
            _scraper = scraper;
        }

        [HttpGet("search")]
        public async Task<IActionResult> Search(string query)
        {
            if (string.IsNullOrWhiteSpace(query))
                return BadRequest("Query parameter is required.");

            try
            {
                var results = await _scraper.SearchProductsAsync(query);

                if (results.Count == 0)
                    return NotFound($"No products found for \"{query}\".");

                // Transform the results to match the expected format
                var formattedResults = results.Select(r => new
                {
                    name = r.Name,
                    brand = r.Brand,
                    price = r.Price,
                    thumbnail = r.Thumbnail,
                    productUrl = r.ProductUrl
                });

                return Ok(formattedResults);
            }
            catch (Exception ex)
            {
                // Log the full exception
                Console.WriteLine($"Error in SamsClubController: {ex}");
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }
    }
}