namespace RS1_2024_25.API.Helper
{
    public static class PasswordStrengthChecker
    {
        public static bool IsStrongPassword(string password)
        {
            // Example criteria:
            // - At least 8 characters
            // - Contains uppercase letters
            // - Contains lowercase letters
            // - Contains digits
            // - Contains special characters
            if (password.Length < 8) return false;
            if (!password.Any(char.IsUpper)) return false;
            if (!password.Any(char.IsLower)) return false;
            if (!password.Any(char.IsDigit)) return false;
            if (!password.Any(ch => !char.IsLetterOrDigit(ch))) return false;

            return true;
        }
    }
}
