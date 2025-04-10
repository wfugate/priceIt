using Microsoft.AspNetCore.Mvc;
using System.Collections.Generic;
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

            //call the correct scraping service method
            var products = _walmartScraperService.SimpleSearchWalmartProducts(query);

            //if no products found, return a 404
            if (products.Count == 0)
            {
                return NotFound("No products found.");
            }

            return Ok(products);
        }
    }
}
