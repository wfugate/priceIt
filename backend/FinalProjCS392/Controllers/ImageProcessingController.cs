using Microsoft.AspNetCore.Mvc;
using Google.Cloud.Vision.V1;
using Microsoft.AspNetCore.Http;
using System.IO;
using System.Threading.Tasks;
using Newtonsoft.Json;
using System.Text;
using System.Linq;

namespace ImageProcessingAPI.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ImageProcessingController : ControllerBase
    {
        //easy as 1, 2, 3!
        //1. process the image from the frontend into an imagestream (ProcessImage Task)
        //2. run label recognition from Vision API on the image (ProcessImageFromStream Task)
        //3. send labels to gemini to identify item (GetRefinedProductName Task)

        //citations - all code was written using these sources along with ChatGPT and Claude for debugging
        //https://learn.microsoft.com/en-us/dotnet/api/system.net.http.httpclient?view=net-9.0
        //https://www.newtonsoft.com/json/help/html/SerializingJSON.htm
        //https://learn.microsoft.com/en-us/dotnet/api/system.convert.frombase64string?view=net-9.0
        //https://ai.google.dev/gemini-api/docs/quickstart?lang=rest
        //https://cloud.google.com/vision/docs

        [HttpGet("test")]
        public IActionResult TestConnection()
        {
            return Ok(new
            {
                status = "API is working",
                timestamp = DateTime.UtcNow,
                server = Environment.MachineName
            });
        }

        [HttpPost("process")]
        public async Task<IActionResult> ProcessImage([FromBody] ImageRequest request)
        {
            try
            {
                //1. check if image is null or empty
                if (string.IsNullOrEmpty(request.Image))
                {
                    return BadRequest("No image data provided.");
                }

                //2. strip base64 metadata (e.g., "data:image/jpeg;base64,")
                string base64Image = request.Image.Replace("data:image/jpeg;base64,", "");

                //3. decode the base64 string to bytes
                byte[] imageBytes = Convert.FromBase64String(base64Image);
                var imageStream = new MemoryStream(imageBytes);

                //4. process the image using our service
                string detectedItem = await ImageLabelProcessor.ProcessImageFromStream(imageStream);

                //5. return the detected item to the client
                return Ok(new { item = detectedItem });
            }
            catch (Exception ex)
            {
                //handle any exceptions that might occur
                return BadRequest(new { error = ex.Message });
            }
        }
    }

    public class ImageRequest
    {
        public string Image { get; set; }
    }

    public static class ImageLabelProcessor
    {
        private static readonly string googleApiKey = "AIzaSyBggbNjNYjJEg7r8A-xL5f_5DH2e3nBpOE"; // just don't steal it :)
        private static readonly string geminiEndpoint = $"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro-001:generateContent?key={googleApiKey}";

        public static async Task<string> ProcessImageFromStream(MemoryStream imageStream)
        {
            try
            {
                //1. initialize the Vision API client
                var client = ImageAnnotatorClient.Create();
                var image = Google.Cloud.Vision.V1.Image.FromStream(imageStream);

                //2. run label detection on the image
                var labels = client.DetectLabels(image);
                List<(string Description, float Score)> labeledItems = new List<(string, float)>();
                foreach (var label in labels)
                {
                    labeledItems.Add((label.Description, label.Score));
                }

                //3. run document text detection to identify text in the image
                var detectedText = DetectDocumentTextFromImage(image);

                //4. send both labels and filtered text to Gemini for processing
                return await GetRefinedProductName(labeledItems, detectedText);
            }
            catch (Exception ex)
            {
                //log any errors that might occur during processing
                Console.WriteLine($"Error during image processing: {ex.Message}");
                return "Error processing the image.";
            }
        }

        private static List<string> DetectDocumentTextFromImage(Google.Cloud.Vision.V1.Image image)
        {
            //1. initialize the Vision API client
            var client = ImageAnnotatorClient.Create();
            var response = client.DetectDocumentText(image);
            var detectedText = new List<string>();
            const float minConfidence = 0.7f; // minimum confidence threshold (70%)

            //2. extract text from document blocks, paragraphs, and words
            if (response != null && response.Pages != null)
            {
                foreach (var page in response.Pages)
                {
                    if (page.Blocks != null)
                    {
                        foreach (var block in page.Blocks)
                        {
                            if (block.Paragraphs != null)
                            {
                                foreach (var paragraph in block.Paragraphs)
                                {
                                    if (paragraph.Words != null)
                                    {
                                        foreach (var word in paragraph.Words)
                                        {
                                            //3. only include words with sufficient confidence
                                            if (word.Confidence >= minConfidence)
                                            {
                                                var wordText = string.Join("", word.Symbols.Select(s => s.Text));
                                                detectedText.Add(wordText);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }

            //4. remove duplicates and return the filtered text
            return detectedText.Distinct().ToList();
        }

        private static async Task<string> GetRefinedProductName(
            List<(string Description, float Score)> labeledItems,
            List<string> detectedText)
        {
            using (var client = new HttpClient())
            {
                //1. extract just the label descriptions from the labeled items
                var labelsOnly = labeledItems.Select(x => x.Description);
                Console.WriteLine($"Labels: {string.Join(", ", labelsOnly)}");

                //2. add text context from high-confidence text detected in the image
                var textContext = detectedText.Any()
                    ? $" Additionally, the following high-confidence text was found in the image: {string.Join(", ", detectedText)}."
                    : "";

                //3. prepare the prompt for Gemini API
                var requestData = new
                {
                    contents = new[]
                    {
                        new
                        {
                            parts = new[]
                            {
                                new
                                {
                                    text = $"Given these detected labels in an image: {string.Join(", ", labelsOnly)}." +
                                           $"{textContext}" +
                                           $"Identify the most likely retail product sold at Walmart or Target. " +
                                           $"If the labels indicate a general category (e.g., 'Cola', 'Chips', 'Cereal'), " +
                                           $"return a well-known brand that fits the description (e.g., 'Coca-Cola', 'Lays Classic Chips', 'Kellogg's Frosted Flakes'). " +
                                           $"However, if the labels already specify a clear product (e.g., 'Pepsi 12-pack', 'Doritos Nacho Cheese 9.25oz'), " +
                                           $"return that exact product name. " +
                                           $"Pay special attention to any brand names or product names found in the detected text. " +
                                           $"Do not guess if the information is unclear; in that case, do not consider brand name and rely on the Labels" +
                                           $"Respond only with the exact name and nothing else NO MATTER WHAT."
                                }
                            }
                        }
                    }
                };

                //4. serialize the request data to JSON
                var jsonContent = JsonConvert.SerializeObject(requestData);
                var httpContent = new StringContent(jsonContent, Encoding.UTF8, "application/json");

                //5. send request to Gemini API
                var response = await client.PostAsync(geminiEndpoint, httpContent);
                var responseString = await response.Content.ReadAsStringAsync();
                Console.WriteLine(responseString);

                //6. parse the response and return the product name
                dynamic jsonResponse = JsonConvert.DeserializeObject(responseString);
                string result;
                if (jsonResponse.candidates[0].content.parts[0].text.ToString().Length > 100)
                {
                    return result = "No Item Detected";
                }
                else
                {
                    return jsonResponse.candidates[0].content.parts[0].text;
                }

            }
        }
    }
}