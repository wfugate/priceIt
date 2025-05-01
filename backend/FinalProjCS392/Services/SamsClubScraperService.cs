using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace FinalProjCS392.Services
{
    public class SamsClubSearchResult
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
                //1. handle price parsing based on value type
                if (value is double doubleValue)
                {
                    _price = doubleValue;
                    _rawPrice = doubleValue.ToString();
                }
                else if (value is string stringValue)
                {
                    _rawPrice = stringValue;
                    //2. extract numeric value from string (remove $ and other non-numeric characters)
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

        [JsonPropertyName("url")]
        public string ProductUrl { get; set; }

        [JsonPropertyName("thumbnail")]
        public string Thumbnail { get; set; }
    }

    public class SamsClubSearchResponse
    {
        [JsonPropertyName("results")]
        public List<SamsClubSearchResult> Results { get; set; }
    }

    public class SamsClubScraperService
    {
        private readonly HttpClient _httpClient;
        private readonly string _apiKey;

        public SamsClubScraperService()
        {
            //1. initialize http client
            _httpClient = new HttpClient();

            //2. Get API key from environment variables
            _apiKey = Environment.GetEnvironmentVariable("UNWRANGLE_KEY") ??
                throw new InvalidOperationException("UNWRANGLE_KEY environment variable is not set");
        }

        public async Task<List<SamsClubSearchResult>> SearchProductsAsync(string query)
        {
            //1. encode the query for url
            string encodedQuery = Uri.EscapeDataString(query);

            //2. construct request url with query and api key
            string requestUrl = $"https://data.unwrangle.com/api/getter/?platform=samsclub_search&search={encodedQuery}&api_key={_apiKey}";

            //3. send http request
            HttpResponseMessage response = await _httpClient.GetAsync(requestUrl);
            Console.WriteLine($"Sam's Club search URL: {requestUrl}");

            //4. check response status
            if (!response.IsSuccessStatusCode)
            {
                throw new Exception($"Sam's Club request failed (HTTP {response.StatusCode}).");
            }

            //5. read response content
            string jsonResponse = await response.Content.ReadAsStringAsync();

            //6. configure json serializer options
            var options = new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true,
                NumberHandling = JsonNumberHandling.AllowReadingFromString
            };

            try
            {
                //7. deserialize json response
                SamsClubSearchResponse data = JsonSerializer.Deserialize<SamsClubSearchResponse>(jsonResponse, options);
                var results = data?.Results ?? new List<SamsClubSearchResult>();

                //8. log results for debugging
                foreach (var result in results)
                {
                    Console.WriteLine($"Name: {result.Name}");
                    Console.WriteLine($"Price: {result.Price}");
                    Console.WriteLine($"URL: {result.Thumbnail}");
                    Console.WriteLine($"Brand: {result.Brand}");
                    Console.WriteLine($"Product URL: {result.ProductUrl}");
                    Console.WriteLine("-------------------");
                }

                //9. order results by price
                results = results.OrderBy(r => r.Price).ToList();

                //10. return the sorted results
                return results;
            }
            catch (JsonException ex)
            {
                //11. log parsing errors and rethrow with context
                Console.WriteLine($"JSON parsing error: {ex.Message}");
                Console.WriteLine($"Raw JSON: {jsonResponse}");
                throw new Exception($"Error parsing Sam's Club response: {ex.Message}");
            }
        }
    }
}