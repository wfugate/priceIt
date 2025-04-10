using System;
using System.Collections.Generic;
using OpenQA.Selenium;
using OpenQA.Selenium.Chrome;
using OpenQA.Selenium.Support.UI;
using System.Threading;
using System.IO;

//Citations - Code was written using previous Selenium knowledge from an internship along with Chatgpt and Claude (For most of the error handling)
//tags were found by inspecting the walmart webpage.

namespace FinalProjCS392.Services
{
    public class WalmartScraperService
    {
        public class Product
        {
            public string? Title { get; set; }
            public string? Price { get; set; }
            public string? ImageUrl { get; set; } 
        }

        public List<Product> SimpleSearchWalmartProducts(string query)
        {
            var products = new List<Product>();
            Console.WriteLine("Starting Walmart product search for: " + query);

            //set up Chrome for headless mode
            var chromeOptions = new ChromeOptions();
            chromeOptions.AddArguments("headless");
            chromeOptions.AddArguments("--disable-gpu");
            chromeOptions.AddArguments("--no-sandbox");
            chromeOptions.AddArguments("--disable-dev-shm-usage");
            chromeOptions.AddArguments("--window-size=1920,1080");

            //add user agent to make the request look more like a regular browser
            chromeOptions.AddArgument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4577.63 Safari/537.36");

            try
            {
                using (var driver = new ChromeDriver(chromeOptions))
                {
                    //build Walmart search URL from query
                    var searchUrl = $"https://www.walmart.com/search?q={Uri.EscapeDataString(query)}";
                    Console.WriteLine("Navigating to URL: " + searchUrl);

                    //navigate to Walmart search page
                    driver.Navigate().GoToUrl(searchUrl);

                    //wait for page to load and render products
                    Thread.Sleep(3000); // Give some time for JavaScript to execute

                    var wait = new WebDriverWait(driver, TimeSpan.FromSeconds(10));

                    //try multiple selectors that might work with Walmart's layout
                    List<IWebElement> productElements = new List<IWebElement>();

                    try
                    {
                        //try first selector
                        productElements = new List<IWebElement>(driver.FindElements(By.CssSelector("div[data-item-id]")));
                        Console.WriteLine($"First selector found {productElements.Count} products");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("First selector failed: " + ex.Message);
                    }

                    //if first selector didn't work, try alternatives
                    if (productElements.Count == 0)
                    {
                        try
                        {
                            productElements = new List<IWebElement>(driver.FindElements(By.CssSelector(".grid-item")));
                            Console.WriteLine($"Second selector found {productElements.Count} products");
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine("Second selector failed: " + ex.Message);
                        }
                    }

                    //alternative selector
                    if (productElements.Count == 0)
                    {
                        try
                        {
                            productElements = new List<IWebElement>(driver.FindElements(By.CssSelector("[data-testid='list-item']")));
                            Console.WriteLine($"Third selector found {productElements.Count} products");
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine("Third selector failed: " + ex.Message);
                        }
                    }

                    //for debugging
                    try
                    {
                        var screenshot = ((ITakesScreenshot)driver).GetScreenshot();
                        screenshot.SaveAsFile("walmart_search_page.png");
                        Console.WriteLine("Screenshot saved as walmart_search_page.png");
                    }
                    catch (Exception ex)
                    {
                        Console.WriteLine("Failed to save screenshot: " + ex.Message);
                    }

                    Console.WriteLine($"Found {productElements.Count} product elements.");

                    //limit to first 5 products
                    int maxItems = 5;
                    int count = 0;

                    foreach (var productElement in productElements)
                    {
                        try
                        {
                            string title = "";
                            string price = "";
                            string imageUrl = "";

                            //try multiple selectors for title
                            try
                            {
                                title = productElement.FindElement(By.CssSelector("[data-automation-id='product-title']"))?.Text.Trim();
                            }
                            catch
                            {
                                try
                                {
                                    title = productElement.FindElement(By.CssSelector("span.display-block"))?.Text.Trim();
                                }
                                catch
                                {
                                    try
                                    {
                                        title = productElement.FindElement(By.CssSelector("span.inline-flex"))?.Text.Trim();
                                    }
                                    catch
                                    {
                                        //last attempt with a generic approach
                                        var possibleTitleElements = productElement.FindElements(By.TagName("span"));
                                        if (possibleTitleElements.Count > 0)
                                        {
                                            foreach (var element in possibleTitleElements)
                                            {
                                                if (element.Text.Length > 10)
                                                { //assume longer text is likely the title
                                                    title = element.Text.Trim();
                                                    break;
                                                }
                                            }
                                        }
                                    }
                                }
                            }

                            //try multiple selectors for price
                            try
                            {
                                price = productElement.FindElement(By.CssSelector("[data-automation-id='product-price']"))?.Text.Trim();
                            }
                            catch
                            {
                                try
                                {
                                    price = productElement.FindElement(By.CssSelector(".price-main"))?.Text.Trim();
                                }
                                catch
                                {
                                    try
                                    {
                                        price = productElement.FindElement(By.CssSelector("div[data-testid='price-primary']"))?.Text.Trim();
                                    }
                                    catch
                                    {
                                        //generic approach for price - look for $ sign
                                        var allSpans = productElement.FindElements(By.TagName("span"));
                                        foreach (var span in allSpans)
                                        {
                                            if (span.Text.Contains("$"))
                                            {
                                                price = span.Text.Trim();
                                                break;
                                            }
                                        }
                                    }
                                }
                            }

                            //try to get image URL 
                            try
                            {
                                var imgElement = productElement.FindElement(By.TagName("img"));
                                imageUrl = imgElement.GetAttribute("src");
                            }
                            catch
                            {
                                //no image
                            }

                            if (!string.IsNullOrEmpty(title) && !string.IsNullOrEmpty(price))
                            {
                                products.Add(new Product
                                {
                                    Title = title,
                                    Price = price,
                                    ImageUrl = imageUrl
                                });

                                count++;
                                Console.WriteLine($"Found product {count}: {title} - {price}");

                                if (count >= maxItems) break;
                            }
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine("Error scraping individual product: " + ex.Message);
                        }
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine("Error in web scraping process: " + ex.Message);
                Console.WriteLine(ex.StackTrace);
            }

            //log the results
            if (products.Count > 0)
            {
                Console.WriteLine($"Successfully found {products.Count} products");
                foreach (var product in products)
                {
                    Console.WriteLine($"Title: {product.Title}, Price: {product.Price}");
                }
            }
            else
            {
                Console.WriteLine("No products found. The scraping selectors might need updating.");
            }

            return products;
        }
    }
}