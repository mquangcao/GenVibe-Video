using AIGenVideo.Server.Abstractions.ImageGenerate;
using AIGenVideo.Server.Infrastructure.Clients;
using AIGenVideo.Server.Services.ImageGenerate;

namespace AIGenVideo.Server.Bootstraping.ImageGenerate
{
    public static class ImageGenerateServerExtension
    {
        public static IServiceCollection AddImageGenerationServices(this IServiceCollection services)
        {
            services.AddScoped<IGeminiImageClient, GeminiImageClient>();
            services.AddScoped<ImageGenerationService>();
            return services;
        }
    }
}