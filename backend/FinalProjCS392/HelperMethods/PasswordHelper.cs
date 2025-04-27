using System.Security.Cryptography;
using System.Text;


//https://www.youtube.com/watch?v=J4ix8Mhi3rs&ab_channel=MilanJovanovi%C4%87
namespace FinalProjCS392.HelperMethods
{

    public static class PasswordHelper
    {

        private const int SaltSize = 16;
        private const int HashSize = 32;
        private const int Iterations = 1000;

        private static readonly HashAlgorithmName SHA = HashAlgorithmName.SHA512;
        public static (string hash, string salt) HashPassword(string password)
        {
            // Generate a cryptographically secure salt
            byte[] saltBytes = RandomNumberGenerator.GetBytes(SaltSize);

            // Derive the hash using PBKDF2
            byte[] hashBytes = Rfc2898DeriveBytes.Pbkdf2(password, saltBytes, Iterations, SHA, HashSize);

            // Convert both to base64 to store them as strings
            string hash = Convert.ToBase64String(hashBytes);
            string salt = Convert.ToBase64String(saltBytes);

            return (hash, salt);

        }

        public static bool VerifyPassword(string password, string storedHash, string storedSalt)
        {
            byte[] saltBytes = Convert.FromBase64String(storedSalt);
            byte[] hashBytes = Rfc2898DeriveBytes.Pbkdf2(password, saltBytes, Iterations, SHA, HashSize);
            string computedHash = Convert.ToBase64String(hashBytes);

            return storedHash == computedHash;

        }
    }

}