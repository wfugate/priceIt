﻿namespace FinalProjCS392.Models
{
    public class EmailModel
    {
        
    }

    public class EmailRequest
    {
        public string ToEmail { get; set; }
        public string UserID { get; set; }
        public List<string> CartIds { get; set; }
    }

    public class EmailSettings
    {
        public string SmtpServer { get; set; }
        public int SmtpPort { get; set; }
        public string SenderEmail { get; set; }
        public string AppPassword { get; set; }
    }

}
