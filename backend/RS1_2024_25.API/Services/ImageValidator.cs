using SixLabors.ImageSharp;
using Microsoft.Extensions.Options;
using System.ComponentModel.DataAnnotations;
using RS1_2024_25.API.Options;
using RS1_2024_25.API.Services.Interfaces;

public class ImageValidator : IImageValidator
{
    private readonly ImageOptions _options;
    private readonly ILogger<ImageValidator> _logger;

    public ImageValidator(
        IOptions<ImageOptions> options,
        ILogger<ImageValidator> logger)
    {
        _options = options.Value;
        _logger = logger;
    }

    public async Task ValidateAsync(IFormFile file)
    {
        if (file == null || file.Length == 0)
        {
            throw new ValidationException("No file was provided.");
        }

        if (file.Length > _options.MaxFileSizeMB * 1024 * 1024)
        {
            throw new ValidationException(
                $"File size exceeds maximum limit of {_options.MaxFileSizeMB}MB.");
        }

        var extension = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!_options.AllowedExtensions.Contains(extension))
        {
            throw new ValidationException(
                $"File type {extension} is not allowed. Allowed types: {string.Join(", ", _options.AllowedExtensions)}");
        }

        try
        {
            using var stream = file.OpenReadStream();
            using var image = await Image.LoadAsync(stream);

            if (image.Width > _options.MaxWidth || image.Height > _options.MaxHeight)
            {
                throw new ValidationException(
                    $"Image dimensions exceed maximum allowed size of {_options.MaxWidth}x{_options.MaxHeight} pixels.");
            }
        }
        catch (Exception ex) when (ex is not ValidationException)
        {
            _logger.LogError(ex, "Invalid image file uploaded");
            throw new ValidationException("The file is not a valid image.");
        }
    }
}