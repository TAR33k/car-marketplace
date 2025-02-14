using RS1_2024_25.API.Data.Enums;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Endpoints.AdvertisementEndpoints;
using FluentValidation.TestHelper;
using RS1_2024_25.API.Tests.Helpers;

namespace RS1_2024_25.API.Tests;

public class AdvertisementUpdateOrInsertValidatorTests
{
    private readonly ApplicationDbContext _dbContext;
    private readonly AdvertisementUpdateOrInsertValidator _validator;

    public AdvertisementUpdateOrInsertValidatorTests()
    {
        _dbContext = TestApplicationDbContext.CreateAsync().GetAwaiter().GetResult();
        _validator = new AdvertisementUpdateOrInsertValidator(_dbContext);
    }

    [Fact]
    public async Task Should_Have_Error_When_Title_Is_Empty()
    {
        var request = new AdvertisementUpdateOrInsertEndpoint.AdvertUpdateOrInsertRequest
        {
            Title = "",
            Description = "Test Description",
            Condition = VehicleCondition.New,
            Price = 1000,
            ExpirationDate = DateTime.Now.AddDays(30),
            CarID = 1
        };

        var result = await _validator.TestValidateAsync(request);
        result.ShouldHaveValidationErrorFor(x => x.Title);
    }

    [Fact]
    public async Task Should_Have_Error_When_Price_Is_Zero()
    {
        var request = new AdvertisementUpdateOrInsertEndpoint.AdvertUpdateOrInsertRequest
        {
            Title = "Test Title",
            Description = "Test Description",
            Condition = VehicleCondition.New,
            Price = 0,
            ExpirationDate = DateTime.Now.AddDays(30),
            CarID = 1
        };

        var result = await _validator.TestValidateAsync(request);
        result.ShouldHaveValidationErrorFor(x => x.Price);
    }

    [Fact]
    public async Task Should_Have_Error_When_ExpirationDate_Is_Past()
    {
        var request = new AdvertisementUpdateOrInsertEndpoint.AdvertUpdateOrInsertRequest
        {
            Title = "Test Title",
            Description = "Test Description",
            Condition = VehicleCondition.New,
            Price = 1000,
            ExpirationDate = DateTime.Now.AddDays(-1),
            CarID = 1
        };

        var result = await _validator.TestValidateAsync(request);
        result.ShouldHaveValidationErrorFor(x => x.ExpirationDate);
    }
}
