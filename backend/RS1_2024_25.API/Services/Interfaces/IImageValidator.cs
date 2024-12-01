namespace RS1_2024_25.API.Services.Interfaces
{
    public interface IImageValidator
    {
        Task ValidateAsync(IFormFile file);
    }
}
