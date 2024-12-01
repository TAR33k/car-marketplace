using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Formats.Jpeg;
using Microsoft.Extensions.Options;
using RS1_2024_25.API.Options;
using RS1_2024_25.API.Services.Interfaces;

namespace RS1_2024_25.API.Services
{
    public class ImageProcessor : IImageProcessor
    {
        private readonly ImageOptions _options;
        private readonly ILogger<ImageProcessor> _logger;

        public ImageProcessor(
            IOptions<ImageOptions> options,
            ILogger<ImageProcessor> logger)
        {
            _options = options.Value;
            _logger = logger;
        }

        public async Task<byte[]> ProcessImageAsync(IFormFile file)
        {
            try
            {
                using var stream = file.OpenReadStream();
                using var image = await Image.LoadAsync(stream);

                // Resize if needed
                if (image.Width > _options.MaxWidth || image.Height > _options.MaxHeight)
                {
                    var resizeOptions = new ResizeOptions
                    {
                        Mode = ResizeMode.Max,
                        Size = new Size(_options.MaxWidth, _options.MaxHeight)
                    };

                    image.Mutate(x => x.Resize(resizeOptions));
                }

                // Save with compression
                using var outputStream = new MemoryStream();
                await image.SaveAsJpegAsync(outputStream, new JpegEncoder
                {
                    Quality = _options.JpegQuality // Use quality from options
                });

                return outputStream.ToArray();
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error processing image");
                throw new ApplicationException("Error processing image", ex);
            }
        }
    }
}
