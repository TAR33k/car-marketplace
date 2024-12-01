namespace RS1_2024_25.API.Services.Interfaces
{
    public interface IImageProcessor
    {
        Task<byte[]> ProcessImageAsync(IFormFile file);
    }
}
