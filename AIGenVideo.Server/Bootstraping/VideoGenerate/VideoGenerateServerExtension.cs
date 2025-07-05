using AIGenVideo.Server.Abstractions.VideoGenerate;
using AIGenVideo.Server.Services.VideoGenerate;

namespace AIGenVideo.Server.Bootstraping.VideoGenerate;

public static class VideoGenerateServerExtension
{
    public static IServiceCollection AddVideoGenerateServices(this IServiceCollection services, IConfiguration configuration)
    {
        // Step 1: Register our interceptor class so it can be created.
        services.AddTransient<AssemblyAiAuthHandler>();

        // Step 2: Configure the HttpClient for our service.
        services.AddHttpClient<ICaptionService, AssemblyAiService>(client =>
        {
            // The ONLY thing we configure here now is the Base Address.
            // All API key logic has been moved to the handler.
            client.BaseAddress = new Uri("https://api.assemblyai.com/v2/");
        })
        // Step 3: Attach our interceptor to the HttpClient's pipeline.
        .AddHttpMessageHandler<AssemblyAiAuthHandler>();

        // Dòng này sẽ đăng ký VideoService để Controller có thể sử dụng.
        services.AddScoped<IVideoService, VideoService>();

        return services;
    }
}