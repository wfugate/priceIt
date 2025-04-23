namespace FinalProjCS392.Models
{
    public class AuthRequest
    {
        public string Email { get; set; }
        public string Password { get; set; }

    }

    public class UpdateProfileRequest
    {
        public string Email { get; set; }
        public string Name { get; set; }
        public int Age { get; set; }

    }
}
