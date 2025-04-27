using FinalProjCS392.Models;
using QuestPDF.Helpers;
using QuestPDF.Fluent;
using QuestPDF.Infrastructure;
using FinalProjCS392.Services;

//https://www.questpdf.com/getting-started.html
namespace priceItBackend.HelperMethods
{
    public class PDFHelper
    {
        private readonly List<Cart> _cartList;

        public PDFHelper(List<Cart> cartList) {
            _cartList = cartList;
        }

        public byte[] GenerateListPdf(List<Cart> carts)
        {
            var logoPath = GetAppLogoPath();
            using var logoStream = new FileStream(logoPath, FileMode.Open, FileAccess.Read);
            Console.WriteLine("Logo Path: " + logoPath);
            Console.WriteLine("File Exists: " + File.Exists(logoPath));

            QuestPDF.Settings.License = LicenseType.Community;
            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Margin(40);
                    page.Size(PageSizes.A4);

                    page.Header().ShowOnce().Row(row =>
                    {
                        row.RelativeItem().Text("Your Cart Summary")
                            .FontSize(20)
                            .Bold()
                            .FontColor(Colors.Black);

                        row.AutoItem().AlignRight().Height(125).Image(logoStream);
                    });


                    page.Content().Column(col =>
                    {
                        foreach (var cart in carts)
                        {
                            var cartTotal = cart.Products.Sum(p => p.Price * p.Quantity);

                            // Cart title
                            col.Item().PaddingVertical(10).Text($"{cart.Name} (${cartTotal:F2})")
                                .FontSize(16).Bold().Underline().FontColor(Colors.Blue.Darken2);

                            // Table header
                            col.Item().Table(table =>
                            {
                                table.ColumnsDefinition(columns =>
                                {
                                    columns.RelativeColumn(4); // Item name
                                    columns.RelativeColumn(2); // Unit Price
                                    columns.RelativeColumn(2); // Quantity
                                    columns.RelativeColumn(2); // Total
                                });

                                // Table Headings
                                table.Header(header =>
                                {
                                    header.Cell().Element(CellStyle).Text("Item Name").Bold();
                                    header.Cell().Element(CellStyle).Text("Unit Price").Bold();
                                    header.Cell().Element(CellStyle).Text("Quantity").Bold();
                                    header.Cell().Element(CellStyle).Text("Total").Bold();

                                    static IContainer CellStyle(IContainer container) =>
                                        container.PaddingVertical(5).PaddingHorizontal(5).Background(Colors.Grey.Lighten3);
                                });

                                // Table rows
                                foreach (var p in cart.Products)
                                {
                                    var rowTotal = p.Price * p.Quantity;

                                    table.Cell().Element(CellPadding).Text(p.Name);
                                    table.Cell().Element(CellPadding).Text($"${p.Price:F2}");
                                    table.Cell().Element(CellPadding).Text(p.Quantity.ToString());
                                    table.Cell().Element(CellPadding).Text($"${rowTotal:F2}");

                                    static IContainer CellPadding(IContainer container) =>
                                        container.PaddingVertical(5).PaddingHorizontal(5);
                                }
                            });

                            // Cart total line
                            col.Item().AlignRight().PaddingTop(5)
                                .Text($"Cart Total: ${cartTotal:F2}")
                                .FontSize(12).Bold().FontColor(Colors.Green.Darken2);

                            col.Item().PaddingBottom(10); // spacing between carts
                        }

                        // Final thank you note
                        col.Item().PaddingTop(30).Text(text =>
                        {
                            text.Line("From The App's Founder:")
                                .FontSize(14)
                                .Bold()
                                .FontColor(Colors.Blue.Medium);
                            text.Line("Thank You For Choosing To Use pricIT! Hope You Have A Wonderful Shopping Day Knowing You Are Getting The Items At Their Lowest!!!")
                                .FontSize(12)
                                .LineHeight(1.4f)
                                .FontColor(Colors.Black);
                        });
                    });

                    page.Footer().AlignCenter().Text("Generated by FinalProjCS392").FontSize(10);
                });
            });

            return document.GeneratePdf();


        }

        private string GetAppLogoPath()
        {
            var rootPath = Directory.GetCurrentDirectory();
            return Path.Combine(rootPath, "wwwroot", "logo", "priceIt.jpg");
        }
    }
}