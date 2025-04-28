using FinalProjCS392.Models;

using MailKit.Net.Smtp;
using Microsoft.Extensions.Options;
using MongoDB.Driver;
using MimeKit;
using priceItBackend.HelperMethods;
using System.Net.Mail;

//https://www.questpdf.com/getting-started.html
namespace FinalProjCS392.Services
{
    public class EmailService
    {
        private readonly EmailSettings _emailSettings;
        private readonly CartService _cartService;

        public EmailService(IOptions<EmailSettings> emailSettings, CartService cartService)
        {
            _emailSettings = emailSettings.Value;
            _cartService = cartService;
        }

        public async Task SendEmailAsync(string toEmail, string userId, List<string> cartIds)
        {
            /// 1. Fetch carts
            var carts = await _cartService.GetCartsByIds(userId, cartIds);

            // Handle case where carts might be null or empty after fetching
            if (carts == null || !carts.Any())
            {
                Console.WriteLine($"No carts found for user {userId} with IDs {string.Join(", ", cartIds)}. Email not sent.");
                // Optionally throw an exception or return indication of failure
                return;
            }

            // 2. Generate PDF
            var pdfHelper = new PDFHelper(); // *** FIXED: Use parameterless constructor ***
            var pdfBytes = await pdfHelper.GenerateListPdf(carts); // Pass carts list here

            // Check if PDF generation failed (based on the modified GeneratePdf method potentially returning null)
            if (pdfBytes == null)
            {
                Console.WriteLine($"PDF generation failed for user {userId}. Email not sent.");
                // Optionally throw an exception or return indication of failure
                return;
            }


            // 3. Prepare Email
            var email = new MimeMessage();
            email.From.Add(MailboxAddress.Parse(_emailSettings.SenderEmail));
            email.To.Add(MailboxAddress.Parse(toEmail));
            email.Subject = "Your Cart Summary"; // Consider making subject more specific if needed

            var builder = new BodyBuilder
            {
                TextBody = "Thank you for shopping with us! Please find your cart summary attached." // Slightly improved text
            };

            // Add attachment
            // Using DateTime for a unique filename could be helpful if users receive multiple summaries
            string attachmentFileName = $"CartSummary_{DateTime.Now:yyyyMMddHHmmss}.pdf";
            builder.Attachments.Add(attachmentFileName, pdfBytes, new ContentType("application", "pdf"));
            email.Body = builder.ToMessageBody();

            // 4. Send Email
            try
            {
                using var smtp = new MailKit.Net.Smtp.SmtpClient();
                // Consider adding logging for connection/authentication steps
                await smtp.ConnectAsync(_emailSettings.SmtpServer, _emailSettings.SmtpPort, MailKit.Security.SecureSocketOptions.StartTls);
                await smtp.AuthenticateAsync(_emailSettings.SenderEmail, _emailSettings.AppPassword);
                await smtp.SendAsync(email);
                await smtp.DisconnectAsync(true);
                Console.WriteLine($"Email sent successfully to {toEmail}");
            }
            catch (Exception ex)
            {
                // Log the exception details
                Console.WriteLine($"Error sending email to {toEmail}: {ex.ToString()}");
                // Rethrow or handle as appropriate for your application's error strategy
                // throw;
            }
        }
    }
}







