using Microsoft.AspNetCore.Mvc;
using FinalProjCS392.Models;
using FinalProjCS392.Services;

namespace FinalProjCS392.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class EmailController : ControllerBase
    {
        private readonly EmailService _emailService;
        public EmailController(EmailService emailService)
        {
            //initialize email service through dependency injection
            _emailService = emailService;
        }

        [HttpPost("send")]
        public async Task<IActionResult> SendEmail([FromBody] EmailRequest request)
        {
            try
            {
                //1. send email with cart details to user
                await _emailService.SendEmailAsync(request.ToEmail, request.UserID, request.CartIds);

                //2. return success message
                return Ok(new { message = "Email sent successfully!" });
            }
            catch (Exception ex)
            {
                //3. handle any errors that occurred during email sending
                return StatusCode(500, new { error = ex.Message });
            }
        }
    }
}