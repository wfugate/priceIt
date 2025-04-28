using FinalProjCS392.Models; // Make sure this using statement is correct for your project structure
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net.Http;       // Required for HttpClient
using System.Threading.Tasks; // Required for Task and async/await

// Ensure this namespace matches your project structure
namespace priceItBackend.HelperMethods
{
    public class PDFHelper
    {
        // HttpClient: Using a static instance is generally recommended over creating
        // new ones repeatedly, especially in server applications, to avoid socket exhaustion.
        // Consider using IHttpClientFactory for more robust management in ASP.NET Core.
        private static readonly HttpClient httpClient = new HttpClient();

        // Parameterless constructor
        public PDFHelper() { }

        /// <summary>
        /// Asynchronously generates a PDF document summarizing shopping carts, including product images downloaded from URLs.
        /// </summary>
        /// <param name="carts">The list of Cart objects to include.</param>
        /// <returns>A Task returning a byte array representing the generated PDF file, or null on generation error.</returns>
        public async Task<byte[]> GenerateListPdf(List<Cart> carts)
        {
            // 1. Load Local Logo (Error tolerant)
            var logoPath = GetAppLogoPath();
            byte[] logoBytes = null;
            try
            {
                if (File.Exists(logoPath))
                {
                    logoBytes = await File.ReadAllBytesAsync(logoPath); // Use async read
                    Console.WriteLine($"Logo loaded: {logoPath}");
                }
                else
                {
                    Console.WriteLine($"Logo file not found: {logoPath}");
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error reading logo file {logoPath}: {ex.Message}");
            }

            // 2. Pre-fetch Product Images Asynchronously (Error tolerant)
            var productImages = new Dictionary<string, byte[]>(); // Key: ProductId or Thumbnail URL, Value: image bytes or null
            if (carts != null)
            {
                // Create tasks for all image downloads
                var downloadTasks = new List<Task>();
                var productsToDownload = new List<(string key, string url)>();

                foreach (var cart in carts.Where(c => c?.Products != null))
                {
                    foreach (var p in cart.Products)
                    {
                        if (!string.IsNullOrEmpty(p.Thumbnail))
                        {
                            string key = p.ProductId ?? p.Thumbnail; // Use ProductId if available, otherwise Thumbnail URL as key
                            if (!productImages.ContainsKey(key)) // Avoid adding duplicate downloads
                            {
                                productImages.Add(key, null); // Add placeholder
                                productsToDownload.Add((key, p.Thumbnail));
                            }
                        }
                    }
                }

                // Execute downloads (potentially in parallel)
                foreach (var item in productsToDownload)
                {
                    downloadTasks.Add(Task.Run(async () =>
                    {
                        try
                        {
                            var imageData = await httpClient.GetByteArrayAsync(item.url);
                            // Use a thread-safe way to update the dictionary if running truly parallel,
                            // but Task.Run + simple assignment is often okay here. For high contention, use ConcurrentDictionary.
                            productImages[item.key] = imageData;
                            Console.WriteLine($"Image downloaded successfully for key: {item.key}");
                        }
                        catch (HttpRequestException httpEx)
                        {
                            Console.WriteLine($"HTTP Error downloading image ({item.url}): {httpEx.StatusCode} - {httpEx.Message}");
                            productImages[item.key] = null; // Keep as null on failure
                        }
                        catch (Exception ex)
                        {
                            Console.WriteLine($"General Error downloading image ({item.url}): {ex.Message}");
                            productImages[item.key] = null; // Keep as null on failure
                        }
                    }));
                }

                // Wait for all download tasks to complete
                await Task.WhenAll(downloadTasks);
                Console.WriteLine("Image pre-fetching complete.");
            }


            // 3. Configure QuestPDF Document
            QuestPDF.Settings.License = LicenseType.Community; // Or your appropriate license

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Margin(40);
                    page.Size(PageSizes.A4);

                    // Page Header Definition
                    page.Header().ShowOnce().PaddingBottom(10).Row(row =>
                    {
                        row.RelativeItem().Column(col =>
                        {
                            col.Item().Text("Your Cart Summary")
                                .FontSize(20).Bold().FontColor(Colors.Black);
                            col.Item().PaddingTop(2).Text($"Generated on: {DateTime.Now:yyyy-MM-dd HH:mm:ss}")
                                .FontSize(9).FontColor(Colors.Grey.Medium);
                        });

                        if (logoBytes != null && logoBytes.Length > 0)
                        {
                            row.AutoItem().AlignRight().Height(60).Image(logoBytes).FitArea(); // Fit logo
                        }
                    });

                    // Page Content Definition
                    page.Content().Column(col =>
                    {
                        if (carts == null || !carts.Any())
                        {
                            col.Item().PaddingTop(20).AlignCenter().Text("No carts to display.").FontSize(14).Italic();
                        }
                        else
                        {
                            // Iterate through each cart
                            foreach (var cart in carts)
                            {
                                var products = cart.Products ?? new List<CartProduct>();
                                var cartTotal = products.Sum(p => p.Price * p.Quantity);

                                col.Item().PaddingVertical(10).Text($"{cart.Name ?? "Unnamed Cart"} (${cartTotal:F2})")
                                    .FontSize(16).Bold().Underline().FontColor(Colors.Blue.Darken2);

                                // Table for this cart's products
                                col.Item().Table(table =>
                                {
                                    table.ColumnsDefinition(columns =>
                                    {
                                        columns.RelativeColumn(1.5f); // Image Column
                                        columns.RelativeColumn(4f);   // Item name
                                        columns.RelativeColumn(2f);   // Store (Reduced Width)
                                        columns.RelativeColumn(2f);   // Unit Price
                                        columns.RelativeColumn(1.8f);   // Quantity
                                        columns.RelativeColumn(1.5f);   // Total
                                    });

                                    // Table Header
                                    table.Header(header =>
                                    {
                                        static IContainer HeaderCellStyle(IContainer c) => c.DefaultTextStyle(ts => ts.Bold()).PaddingVertical(5).PaddingHorizontal(5).Background(Colors.Grey.Lighten3);

                                        header.Cell().Element(HeaderCellStyle).AlignCenter().Text("Image"); // Centered header text
                                        header.Cell().Element(HeaderCellStyle).Text("Item Name");
                                        header.Cell().Element(HeaderCellStyle).Text("Store");
                                        header.Cell().Element(HeaderCellStyle).AlignRight().Text("Unit Price"); // Align numeric header
                                        header.Cell().Element(HeaderCellStyle).AlignRight().Text("Quantity");   // Align numeric header
                                        header.Cell().Element(HeaderCellStyle).AlignRight().Text("Total");      // Align numeric header
                                    });

                                    // Table Rows
                                    if (!products.Any())
                                    {
                                        table.Cell().ColumnSpan(6).Padding(10).AlignCenter().Text("No products in this cart.").Italic().FontColor(Colors.Grey.Medium);
                                    }
                                    else
                                    {
                                        foreach (var p in products)
                                        {
                                            var rowTotal = p.Price * p.Quantity;
                                            // Define cell style within the loop or reuse static function if simple
                                            static IContainer DataCellStyle(IContainer c) => c.BorderBottom(1).BorderColor(Colors.Grey.Lighten2).PaddingVertical(5).PaddingHorizontal(5).AlignMiddle(); // Align vertically middle

                                            // --- Image Cell ---
                                            var imageCell = table.Cell().Element(DataCellStyle); // Apply style first
                                            string imageKey = p.ProductId ?? p.Thumbnail;
                                            if (productImages.TryGetValue(imageKey, out byte[] currentImageBytes) && currentImageBytes != null && currentImageBytes.Length > 0)
                                            {
                                                imageCell.AlignCenter().Image(currentImageBytes).FitArea(); // Let FitArea handle scaling within the cell padding
                                            }
                                            else
                                            {
                                                imageCell.AlignCenter().Text("[No Image]").FontSize(8).FontColor(Colors.Grey.Medium); // Placeholder
                                            }

                                            // --- Other Data Cells ---
                                            table.Cell().Element(DataCellStyle).Text(p.Name ?? "N/A");
                                            table.Cell().Element(DataCellStyle).Text(p.Store ?? "N/A");
                                            table.Cell().Element(DataCellStyle).AlignRight().Text($"${p.Price:F2}");
                                            table.Cell().Element(DataCellStyle).AlignRight().Text(p.Quantity.ToString());
                                            table.Cell().Element(DataCellStyle).AlignRight().Text($"${rowTotal:F2}");
                                        }
                                    }
                                }); // End Table

                                // Cart Total
                                col.Item().AlignRight().PaddingTop(5).Text($"Cart Total: ${cartTotal:F2}")
                                    .FontSize(12).Bold().FontColor(Colors.Green.Darken2);

                                col.Item().PaddingBottom(20); // Space between carts
                            } // End foreach cart
                        } // End else (carts exist)

                        // Final Thank You Note
                        col.Item().PaddingTop(30).Text(text =>
                        {
                            text.Span("From The App's Founder:").FontSize(14).Bold().FontColor(Colors.Blue.Medium);
                            text.EmptyLine();
                            text.Span("Thank You For Choosing To Use priceIt! Hope You Have A Wonderful Shopping Day Knowing You Are Getting The Items At Their Lowest!!!")
                                .FontSize(12).LineHeight(1.4f).FontColor(Colors.Black);
                        });
                    }); // End Page Content Column

                    // Page Footer Definition
                    page.Footer()
                      .AlignCenter()
                      .Text(x =>
                      {
                          x.Span("Generated by priceIt on ").FontSize(9).FontColor(Colors.Grey.Medium);
                          x.Span($"{DateTime.Now:yyyy-MM-dd}").FontSize(9).FontColor(Colors.Grey.Medium);
                          x.Span(" - Page ").FontSize(9).FontColor(Colors.Grey.Medium);
                          x.CurrentPageNumber().FontSize(9).FontColor(Colors.Grey.Medium);
                          x.Span(" of ").FontSize(9).FontColor(Colors.Grey.Medium);
                          x.TotalPages().FontSize(9).FontColor(Colors.Grey.Medium);
                      });
                }); // End Page Definition
            }); // End Document Creation

            // 4. Generate PDF Bytes (Synchronous part of QuestPDF)
            try
            {
                Console.WriteLine("Generating PDF bytes...");
                var pdfBytesResult = document.GeneratePdf();
                Console.WriteLine("PDF generation complete.");
                return pdfBytesResult;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"!!! Error generating PDF bytes: {ex.ToString()}"); // Log full exception
                return null; // Return null to indicate failure
            }
        }

        /// <summary>
        /// Gets the absolute path to the application logo file.
        /// </summary>
        private string GetAppLogoPath()
        {
            try
            {
                var rootPath = Directory.GetCurrentDirectory();
                // Consider using AppContext.BaseDirectory if CurrentDirectory is unreliable
                // var rootPath = AppContext.BaseDirectory;
                var logoPath = Path.Combine(rootPath, "wwwroot", "logo", "priceIt.jpg"); // Ensure filename is correct
                return logoPath;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error determining logo path: {ex.Message}");
                return string.Empty; // Return empty or null if path cannot be determined
            }
        }
    }
}