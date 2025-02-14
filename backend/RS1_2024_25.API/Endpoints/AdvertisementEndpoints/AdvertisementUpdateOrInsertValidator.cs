using FluentValidation;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using static RS1_2024_25.API.Endpoints.AdvertisementEndpoints.AdvertisementUpdateOrInsertEndpoint;

namespace RS1_2024_25.API.Endpoints.AdvertisementEndpoints
{
    public class AdvertisementUpdateOrInsertValidator : AbstractValidator<AdvertUpdateOrInsertRequest>
    {
        public AdvertisementUpdateOrInsertValidator(ApplicationDbContext dbContext)
        {
            // Title validation
            RuleFor(x => x.Title)
                .NotEmpty().WithMessage("Title is required.")
                .MinimumLength(3).WithMessage("Title must be at least 3 characters long.")
                .MaximumLength(100).WithMessage("Title cannot exceed 100 characters.")
                .Matches("^[a-zA-Z0-9 šđčćžŠĐČĆŽ,.!?-]+$")
                .WithMessage("Title can only contain letters, numbers, spaces and basic punctuation.");

            // Description validation
            RuleFor(x => x.Description)
                .NotEmpty().WithMessage("Description is required.")
                .MaximumLength(1000).WithMessage("Description cannot exceed 1000 characters.");

            // Price validation
            RuleFor(x => x.Price)
                .GreaterThan(0).WithMessage("Price must be greater than 0.")
                .LessThan(1000000).WithMessage("Price cannot exceed 1,000,000.");

            // Condition validation
            RuleFor(x => x.Condition)
                .IsInEnum().WithMessage("Invalid vehicle condition.");

            // Car validation
            RuleFor(x => x.CarID)
                .GreaterThan(0).WithMessage("Car ID must be greater than 0.")
                .MustAsync(async (carId, cancellation) =>
                {
                    return await dbContext.Cars.AnyAsync(c => c.ID == carId, cancellation);
                }).WithMessage("Selected car does not exist.");

            // Expiration date validation
            RuleFor(x => x.ExpirationDate)
                .NotNull().WithMessage("Expiration date is required.")
                .Must(date => date > DateTime.Now)
                .WithMessage("Expiration date must be in the future.");

            // Business rule: Check if car is already in use in another active advertisement
            RuleFor(x => x)
                .MustAsync(async (request, cancellation) =>
                {
                    if (request.ID == 0) // New advertisement
                    {
                        var activeStatus = await dbContext.StatusTypes
                            .FirstOrDefaultAsync(s => s.Name == "Active", cancellation);

                        if (activeStatus == null)
                            return false;

                        return !await dbContext.Advertisements
                            .AnyAsync(a =>
                                a.CarID == request.CarID &&
                                a.StatusID == activeStatus.ID &&
                                a.ID != request.ID,
                                cancellation);
                    }
                    return true;
                })
                .WithMessage("This car is already listed in another active advertisement.");

            // Additional validation for updates
            When(x => x.ID > 0, () =>
            {
                RuleFor(x => x.ID)
                    .MustAsync(async (id, cancellation) =>
                    {
                        return await dbContext.Advertisements.AnyAsync(a => a.ID == id, cancellation);
                    }).WithMessage("Advertisement not found.");
            });
        }
    }
}
