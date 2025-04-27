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
            _scraper = new TargetWebScraperService();
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
                    return NotFound($"No products found for \"{ query}\".");

                return Ok(results);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"An error occurred: {ex.Message}");
            }
        }
    }
}