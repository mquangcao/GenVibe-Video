using CloudinaryDotNet;
using CloudinaryDotNet.Actions;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Logging;

namespace AIGenVideo.Server.Services
{
    public class CloudinaryService
    {
        private readonly Cloudinary _cloudinary;
        private readonly ILogger<CloudinaryService> _logger;

        public CloudinaryService(ILogger<CloudinaryService> logger)
        {
            _logger = logger;
            // THAY THẾ CÁC GIÁ TRỊ PLACEHOLDER BẰNG KEY THẬT CỦA BẠN
            Account account = new Account("dlblfqh8g", "191956525617178", "Q1E8F1xUilrpSEt-U3PJkmD8w-k");
            _cloudinary = new Cloudinary(account);
        }

        public async Task<(bool IsSuccess, string? Url, string? PublicId, string? ErrorMessage)> UploadFileAsync(IFormFile file, string folder)
        {
            if (file == null || file.Length == 0)
            {
                return (false, null, null, "File is empty.");
            }

            try
            {
                await using var stream = file.OpenReadStream();
            
                var uploadParams = new AutoUploadParams
                {
                    File = new FileDescription(file.FileName, stream),
                    Folder = folder,
                };
        
                var uploadResult = await _cloudinary.UploadAsync(uploadParams);

                if (uploadResult.Error != null)
                {
                    _logger.LogError("Cloudinary upload failed: {Error}", uploadResult.Error.Message);
                    return (false, null, null, uploadResult.Error.Message);
                }

                // Kết quả trả về không đổi
                return (true, uploadResult.SecureUrl.ToString(), uploadResult.PublicId, null);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "An exception occurred during file upload.");
                return (false, null, null, ex.Message);
            }
        }

        public async Task<bool> DeleteFileAsync(string publicId)
        {
            var deletionParams = new DeletionParams(publicId) { ResourceType = ResourceType.Raw };
            var result = await _cloudinary.DestroyAsync(deletionParams);
            if (result.Result != "ok")
            {
                deletionParams.ResourceType = ResourceType.Video;
                result = await _cloudinary.DestroyAsync(deletionParams);
            }
            return result.Result == "ok";
        }
    }
}