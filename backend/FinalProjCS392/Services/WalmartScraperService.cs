using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using Env;

namespace FinalProjCS392.Services
{
    public class WalmartSearchResult
    {
        private double _price;
        private string _rawPrice;

        [JsonPropertyName("name")]
        public string Name { get; set; }

        [JsonPropertyName("brand")]
        public string Brand { get; set; }

        // Custom handling for price to deal with different formats
        [JsonPropertyName("price")]
        public object RawPrice
        {
            get { return _rawPrice; }
            set
            {
                if (value is double doubleValue)
                {
                    _price = doubleValue;
                    _rawPrice = doubleValue.ToString();
                }
                else if (value is string stringValue)
                {
                    _rawPrice = stringValue;
                    // Try to extract numeric value from string (remove $ and other non-numeric characters)
                    var numericString = Regex.Replace(stringValue, @"[^\d.]", "");
                    if (double.TryParse(numericString, out double parsedValue))
                    {
                        _price = parsedValue;
                    }
                    else
                    {
                        _price = 0;
                    }
                }
                else if (value != null)
                {
                    _rawPrice = value.ToString();
                    var numericString = Regex.Replace(_rawPrice, @"[^\d.]", "");
                    if (double.TryParse(numericString, out double parsedValue))
                    {
                        _price = parsedValue;
                    }
                    else
                    {
                        _price = 0;
                    }
                }
                else
                {
                    _price = 0;
                    _rawPrice = "0";
                }
            }
        }

        // Public property to get the cleaned price
        [JsonIgnore]
        public double Price => _price;

        [JsonPropertyName("thumbnail")]
        public string Thumbnail { get; set; }

        [JsonPropertyName("url")]
        public string ProductUrl { get; set; }
    }

    public class WalmartSearchResponse
    {
        [JsonPropertyName("results")]
        public List<WalmartSearchResult> Results { get; set; }
    }

    public class WalmartScraperService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey = EnvConfig.UnwrangleApiKey;

        public WalmartScraperService()
        {
            _httpClient = new HttpClient();
        }

        public async Task<List<WalmartSearchResult>> SearchProductsAsync(string query)
        {
            string encodedQuery = Uri.EscapeDataString(query);
            string requestUrl = $"https://data.unwrangle.com/api/getter/?platform=walmart_search&search={encodedQuery}&api_key={_apiKey}";

            HttpResponseMessage response = await _httpClient.GetAsync(requestUrl);
            Console.WriteLine($"Walmart response: {requestUrl}");

            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"Walmart request failed (HTTP {response.StatusCode}).");
            }

            string jsonResponse = await response.Content.ReadAsStringAsync();

            Console.WriteLine($"Walmart Json Response: \n {jsonResponse}");

            // Use custom JsonSerializerOptions to handle potential conversion issues
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                NumberHandling = JsonNumberHandling.AllowReadingFromString
            };

            try
            {
                WalmartSearchResponse data = JsonSerializer.Deserialize<WalmartSearchResponse>(jsonResponse, options);
                var results = data?.Results ?? new List<WalmartSearchResult>();

                foreach (var result in results)
                {
                    Console.WriteLine($"Name: {result.Name}");
                    Console.WriteLine($"Price: {result.Price}");
                    Console.WriteLine($"URL: {result.Thumbnail}");
                    Console.WriteLine($"Brand: {result.Brand}");
                    Console.WriteLine($"ProductUrl {result.ProductUrl}");
                    Console.WriteLine("-------------------");
                }

                // Order results by price
                results = results.OrderBy(r => r.Price).ToList();

                return results;
            }
            catch (JsonException ex)
            {
                Console.WriteLine($"JSON parsing error: {ex.Message}");
                Console.WriteLine($"Raw JSON: {jsonResponse}");
                throw new Exception($"Error parsing Walmart response: {ex.Message}");
            }
        }

        // Keeping this method for backwards compatibility
        public List<WalmartSearchResult> SimpleSearchWalmartProducts(string query)
        {
            return SearchProductsAsync(query).GetAwaiter().GetResult();
        }
    }
}