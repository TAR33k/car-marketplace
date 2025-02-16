using FluentValidation;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using static RS1_2024_25.API.Endpoints.UserEndpoints.UserUpdateOrInsertEndpoint;

namespace RS1_2024_25.API.Endpoints.UserEndpoints
{
    public class UserUpdateOrInsertValidator : AbstractValidator<UserUpdateOrInsertRequest>
    {
        public UserUpdateOrInsertValidator(ApplicationDbContext dbContext)
        {
            // Username validation
            RuleFor(x => x.Username)
                .NotEmpty().WithMessage("Username is required.")
                .MinimumLength(3).WithMessage("Username must be at least 3 characters long.")
                .MaximumLength(50).WithMessage("Username cannot exceed 50 characters.")
                .Matches("^[a-zA-Z0-9_-]*$").WithMessage("Username can only contain letters, numbers, underscore and dash.");

            // First Name validation
            RuleFor(x => x.FirstName)
                .NotEmpty().WithMessage("First name is required.")
                .MaximumLength(50).WithMessage("First name cannot exceed 50 characters.")
                .Matches("^[a-zA-Z\\s]*$").WithMessage("First name can only contain letters and spaces.");

            // Last Name validation
            RuleFor(x => x.LastName)
                .NotEmpty().WithMessage("Last name is required.")
                .MaximumLength(50).WithMessage("Last name cannot exceed 50 characters.")
                .Matches("^[a-zA-Z\\s]*$").WithMessage("Last name can only contain letters and spaces.");

            // Email validation
            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required.")
                .EmailAddress().WithMessage("Please enter a valid email address.")
                .MaximumLength(100).WithMessage("Email cannot exceed 100 characters.");

            // Phone Number validation
            RuleFor(x => x.PhoneNumber)
                .NotEmpty().WithMessage("Phone number is required.")
                .MaximumLength(20).WithMessage("Phone number cannot exceed 20 characters.")
                .Matches(@"^(?:(?:\+|00)?387|0)?6[0-3][0-9]{6,7}$").WithMessage("Please enter a valid phone number.");

            // Address validation
            RuleFor(x => x.Address)
                .NotEmpty().WithMessage("Address is required.")
                .MaximumLength(200).WithMessage("Address cannot exceed 200 characters.");

            // Password validation
            When(x => x.ID == null || x.ID == 0 || !string.IsNullOrEmpty(x.Password), () =>
            {
                RuleFor(x => x.Password)
                    .NotEmpty().WithMessage("Password is required for new users.")
                    .MinimumLength(8).WithMessage("Password must be at least 8 characters long.")
                    .Matches(@"[A-Z]").WithMessage("Password must contain at least one uppercase letter.")
                    .Matches(@"[a-z]").WithMessage("Password must contain at least one lowercase letter.")
                    .Matches(@"[0-9]").WithMessage("Password must contain at least one number.")
                    .Matches(@"[@$!%*?&]").WithMessage("Password must contain at least one special character (@$!%*?&).");
            });

            // Additional validation for updates
            When(x => x.ID.HasValue && x.ID > 0, () =>
            {
                RuleFor(x => x.ID)
                    .MustAsync(async (id, cancellation) =>
                    {
                        return await dbContext.Users.AnyAsync(u => u.ID == id, cancellation);
                    }).WithMessage("User not found.");
            });
        }
    }
}
