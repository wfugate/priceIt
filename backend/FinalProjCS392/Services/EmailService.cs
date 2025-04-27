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

            // 2. Generate PDF
            var PDF = new PDFHelper(carts);
            var pdfBytes = PDF.GenerateListPdf(carts);



            var email = new MimeMessage();
            email.From.Add(MailboxAddress.Parse(_emailSettings.SenderEmail));
            email.To.Add(MailboxAddress.Parse(toEmail));
            email.Subject = "Your Cart Summary";

            var builder = new BodyBuilder
            {
                TextBody = "Please find attached your cart summary PDF."
            };

            builder.Attachments.Add("CartSummary.pdf", pdfBytes, new ContentType("application", "pdf"));
            email.Body = builder.ToMessageBody();


            using var smtp = new MailKit.Net.Smtp.SmtpClient();
            await smtp.ConnectAsync(_emailSettings.SmtpServer, _emailSettings.SmtpPort, MailKit.Security.SecureSocketOptions.StartTls);
            await smtp.AuthenticateAsync(_emailSettings.SenderEmail, _emailSettings.AppPassword);
            await smtp.SendAsync(email);
            await smtp.DisconnectAsync(true);

        }

    }

}

    




