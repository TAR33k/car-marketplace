using RS1_2024_25.API.Services.Interfaces;

namespace RS1_2024_25.API.Services
{
    public class LocalImageStorage : IImageStorage
    {
        private readonly IWebHostEnvironment _environment;
        private readonly ILogger<LocalImageStorage> _logger;
        private const string ImageDirectory = "uploads/images";

        public LocalImageStorage(
            IWebHostEnvironment environment,
            ILogger<LocalImageStorage> logger)
        {
            _environment = environment;
            _logger = logger;
        }

        public async Task<ImageResult> SaveAsync(byte[] imageData, string originalFileName)
        {
            try
            {
                var uploadsFolder = Path.Combine(_environment.WebRootPath, ImageDirectory);
                Directory.CreateDirectory(uploadsFolder);

                // Generate unique filename
                var extension = Path.GetExtension(originalFileName);
                var fileName = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(uploadsFolder, fileName);

                await File.WriteAllBytesAsync(filePath, imageData);

                return new ImageResult
                {
                    FileName = fileName,
                    Url = GetImageUrl(fileName),
                    Size = imageData.Length
                };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error saving image to local storage");
                throw new ApplicationException("Error saving image", ex);
            }
        }

        public Task DeleteAsync(string imageUrl)
        {
            if (string.IsNullOrEmpty(imageUrl))
                return Task.CompletedTask;

            try
            {
                var fileName = Path.GetFileName(imageUrl);
                var filePath = Path.Combine(_environment.WebRootPath, ImageDirectory, fileName);

                if (File.Exists(filePath))
                    File.Delete(filePath);

                return Task.CompletedTask;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error deleting image from local storage");
                throw new ApplicationException("Error deleting image", ex);
            }
        }

        public string GetImageUrl(string fileName)
        {
            return $"/{ImageDirectory}/{fileName}";
        }
    }
}
