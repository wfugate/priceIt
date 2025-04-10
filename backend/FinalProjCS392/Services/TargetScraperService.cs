using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;
using Env;

// This is Anthony's code in ChatGpt

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
    }

    public class TargetSearchResponse
    {
        [JsonPropertyName("results")]
        public List<SearchResult> Results { get; set; }
    }

    public class TargetWebScraperService
    {
        private readonly HttpClient _httpClient;
        string _apiKey = Env.EnvConfig.UnwrangleApiKey;


        public TargetWebScraperService()
        {
            _httpClient = new HttpClient();
        }

        public async Task<List<SearchResult>> SearchProductsAsync(string query)
        {
            string encodedQuery = Uri.EscapeDataString(query);
            string requestUrl = $"https://data.unwrangle.com/api/getter/?platform=target_search&search={encodedQuery}&api_key={_apiKey}";

            HttpResponseMessage response = await _httpClient.GetAsync(requestUrl);
            Console.WriteLine(requestUrl.ToString());

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"Request failed (HTTP {response.StatusCode}).");
            }

            string jsonResponse = await response.Content.ReadAsStringAsync();
            //Console.WriteLine(jsonResponse);
            TargetSearchResponse data = JsonSerializer.Deserialize<TargetSearchResponse>(jsonResponse);
            var results = data?.Results ?? new List<SearchResult>();
            foreach (var result in results)
            {
                Console.WriteLine($"Name: {result.Name}");
                Console.WriteLine($"Price: {result.Price}");
                Console.WriteLine($"URL: {result.Thumbnail}");
                Console.WriteLine($"Brand: {result.Brand}");
                Console.WriteLine("-------------------");
            }

            results.OrderBy(r => r.Price).ToList();

            return results;
        }
    }
}