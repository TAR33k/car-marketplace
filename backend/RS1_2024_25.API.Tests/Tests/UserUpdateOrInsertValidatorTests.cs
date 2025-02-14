using FluentValidation.TestHelper;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Endpoints.UserEndpoints;
using RS1_2024_25.API.Tests.Helpers;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace RS1_2024_25.API.Tests
{
    public class UserUpdateOrInsertValidatorTests
    {
        private readonly ApplicationDbContext _dbContext;
        private readonly UserUpdateOrInsertValidator _validator;

        public UserUpdateOrInsertValidatorTests()
        {
            _dbContext = TestApplicationDbContext.CreateAsync().GetAwaiter().GetResult();
            _validator = new UserUpdateOrInsertValidator(_dbContext);
        }

        [Fact]
        public async Task Should_Have_Error_When_Username_Is_Invalid()
        {
            var request = new UserUpdateOrInsertEndpoint.UserUpdateOrInsertRequest
            {
                Username = "u$er@123", // Invalid characters
                FirstName = "John",
                LastName = "Doe",
                Email = "john@example.com",
                PhoneNumber = "+1234567890",
                Address = "Test Address",
                Password = "TestPass123!"
            };

            var result = await _validator.TestValidateAsync(request);
            result.ShouldHaveValidationErrorFor(x => x.Username);
        }

        [Fact]
        public async Task Should_Have_Error_When_Email_Is_Invalid()
        {
            var request = new UserUpdateOrInsertEndpoint.UserUpdateOrInsertRequest
            {
                Username = "testuser",
                FirstName = "John",
                LastName = "Doe",
                Email = "invalid-email",
                PhoneNumber = "+1234567890",
                Address = "Test Address",
                Password = "TestPass123!"
            };

            var result = await _validator.TestValidateAsync(request);
            result.ShouldHaveValidationErrorFor(x => x.Email);
        }

        [Fact]
        public async Task Should_Have_Error_When_Password_Is_Weak()
        {
            var request = new UserUpdateOrInsertEndpoint.UserUpdateOrInsertRequest
            {
                Username = "testuser",
                FirstName = "John",
                LastName = "Doe",
                Email = "john@example.com",
                PhoneNumber = "+1234567890",
                Address = "Test Address",
                Password = "weak" // Weak password
            };

            var result = await _validator.TestValidateAsync(request);
            result.ShouldHaveValidationErrorFor(x => x.Password);
        }
    }
}
