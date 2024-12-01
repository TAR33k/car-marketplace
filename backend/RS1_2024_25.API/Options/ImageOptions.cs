namespace RS1_2024_25.API.Options
{
    // Options/ImageOptions.cs
    public class ImageOptions
    {
        public int MaxFileSizeMB { get; set; } = 10;
        public string[] AllowedExtensions { get; set; } = { ".jpg", ".jpeg", ".png" };
        public int MaxWidth { get; set; } = 1920;
        public int MaxHeight { get; set; } = 1080;
        public int JpegQuality { get; set; } = 80;
    }
}
