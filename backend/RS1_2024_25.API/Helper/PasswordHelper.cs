using System.Security.Cryptography;

namespace RS1_2024_25.API.Helper
{
    public static class PasswordHelper
    {
        private const int SaltSize = 16; // 128-bit
        private const int KeySize = 32; // 256-bit
        private const int Iterations = 10000;

        public static string HashPassword(string password)
        {
            using (var algorithm = new Rfc2898DeriveBytes(password, SaltSize, Iterations, HashAlgorithmName.SHA256))
            {
                var salt = algorithm.Salt;
                var key = algorithm.GetBytes(KeySize);
                return $"{Convert.ToBase64String(salt)}:{Convert.ToBase64String(key)}";
            }
        }

        public static bool VerifyPassword(string password, string hashedPassword)
        {
            var parts = hashedPassword.Split(':');
            if (parts.Length != 2)
            {
                throw new FormatException("Unexpected hash format. Should be formatted as `{salt}:{hash}`");
            }

            var salt = Convert.FromBase64String(parts[0]);
            var key = Convert.FromBase64String(parts[1]);

            using (var algorithm = new Rfc2898DeriveBytes(password, salt, Iterations, HashAlgorithmName.SHA256))
            {
                var keyToCheck = algorithm.GetBytes(KeySize);
                return keyToCheck.SequenceEqual(key);
            }
        }
    }
}