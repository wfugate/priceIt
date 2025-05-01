using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;


namespace UnwrangleTargetDemo
{
    public class SearchResult
    {
        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("brand")]
        public string Brand { get; set; }

        [JsonPropertyName("price")]
        public double Price { get; set; }

        [JsonPropertyName("thumbnail")]
        public string Thumbnail { get; set; }

        [JsonPropertyName("url")]
        public string ProductUrl { get; set; }
    }

    public class TargetSearchResponse
    {
        [JsonPropertyName("results")]
        public List<SearchResult> Results { get; set; }
    }

    public class TargetWebScraperService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public TargetWebScraperService()
        {
            //1. initialize http client
            _httpClient = new HttpClient();

            //2. Get API key from environment variables
            _apiKey = Environment.GetEnvironmentVariable("UNWRANGLE_KEY") ??
                throw new InvalidOperationException("UNWRANGLE_KEY environment variable is not set");
        }

        public async Task<List<SearchResult>> SearchProductsAsync(string query)
        {
            //1. encode the query for url
            string encodedQuery = Uri.EscapeDataString(query);

            //2. construct request url with query and api key
            string requestUrl = $"https://data.unwrangle.com/api/getter/?platform=target_search&search={encodedQuery}&api_key={_apiKey}";

            //3. send http request
            HttpResponseMessage response = await _httpClient.GetAsync(requestUrl);
            Console.WriteLine(requestUrl.ToString());

            //4. check response status
            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"Request failed (HTTP {response.StatusCode}).");
            }

            //5. read response content
            string jsonResponse = await response.Content.ReadAsStringAsync();
            Console.WriteLine(jsonResponse);

            //6. deserialize json response
            TargetSearchResponse data = JsonSerializer.Deserialize<TargetSearchResponse>(jsonResponse);
            var results = data?.Results ?? new List<SearchResult>();

            //7. log results for debugging
            foreach (var result in results)
            {
                Console.WriteLine($"Name: {result.Name}");
                Console.WriteLine($"Price: {result.Price}");
                Console.WriteLine($"URL: {result.Thumbnail}");
                Console.WriteLine($"Brand: {result.Brand}");
                Console.WriteLine($"ProductUrl: {result.ProductUrl}");
                Console.WriteLine("-------------------");
            }

            //8. order results by price
            results.OrderBy(r => r.Price).ToList();

            //9. return the results
            return results;
        }
    }
}