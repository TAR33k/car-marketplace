namespace RS1_2024_25.API.Services.Interfaces
{
    public interface IImageStorage
    {
        Task<ImageResult> SaveAsync(byte[] imageData, string originalFileName);
        Task DeleteAsync(string imageUrl);
        string GetImageUrl(string fileName);
    }

    public class ImageResult
    {
        public string FileName { get; set; }
        public string Url { get; set; }
        public long Size { get; set; }
    }
}
