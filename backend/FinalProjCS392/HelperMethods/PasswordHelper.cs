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
            //1. generate a cryptographically secure salt
            byte[] saltBytes = RandomNumberGenerator.GetBytes(SaltSize);

            //2. derive the hash using PBKDF2
            byte[] hashBytes = Rfc2898DeriveBytes.Pbkdf2(password, saltBytes, Iterations, SHA, HashSize);

            //3. convert both hash and salt to base64 to store them as strings
            string hash = Convert.ToBase64String(hashBytes);
            string salt = Convert.ToBase64String(saltBytes);

            //4. return the hash and salt as a tuple
            return (hash, salt);
        }

        public static bool VerifyPassword(string password, string storedHash, string storedSalt)
        {
            //1. convert the salt from base64 string to bytes
            byte[] saltBytes = Convert.FromBase64String(storedSalt);

            //2. compute the hash of the provided password using the stored salt
            byte[] hashBytes = Rfc2898DeriveBytes.Pbkdf2(password, saltBytes, Iterations, SHA, HashSize);

            //3. convert the computed hash to base64 string
            string computedHash = Convert.ToBase64String(hashBytes);

            //4. compare the computed hash with the stored hash
            return storedHash == computedHash;
        }
    }
}