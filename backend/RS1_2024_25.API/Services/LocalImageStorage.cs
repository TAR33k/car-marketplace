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
                _logger.LogInformation($"WebRootPath: {_environment.WebRootPath}");
                _logger.LogInformation($"Uploads Folder: {uploadsFolder}");

                // Check if uploadsFolder is null or empty
                if (string.IsNullOrEmpty(_environment.WebRootPath))
                {
                    throw new InvalidOperationException("WebRootPath is not set.");
                }

                // Create directory if it doesn't exist
                if (!Directory.Exists(uploadsFolder))
                {
                    Directory.CreateDirectory(uploadsFolder);
                    _logger.LogInformation($"Created directory: {uploadsFolder}");
                }

                // Validate original file name
                if (string.IsNullOrEmpty(originalFileName))
                {
                    throw new ArgumentException("File name cannot be null or empty.", nameof(originalFileName));
                }

                // Generate unique filename
                var extension = Path.GetExtension(originalFileName);
                if (string.IsNullOrEmpty(extension))
                {
                    throw new ArgumentException("File name must have an extension.", nameof(originalFileName));
                }

                var fileName = $"{Guid.NewGuid()}{extension}";
                var filePath = Path.Combine(uploadsFolder, fileName);
                _logger.LogInformation($"File Path: {filePath}");

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
            return $"http://localhost:7000/{ImageDirectory}/{fileName}";
        }
    }
}
