using AIGenVideo.Server.Abstractions.ImageGenerate;
using AIGenVideo.Server.Models.RequestModels.ImageGenerate;

namespace AIGenVideo.Server.Services.ImageGenerate
{
    public class ImageGenerationService
    {
        private readonly IGeminiImageClient _geminiImageClient;

        public ImageGenerationService(IGeminiImageClient geminiImageClient)
        {
            _geminiImageClient = geminiImageClient;
        }

        public async Task<string> GenerateImageAsync(GenerateImageRequest request)
        {
            return await _geminiImageClient.GenerateImageAsync(request.Prompt);
        }
    }
}