using AIGenVideo.Server.Abstractions.ContentGenerate;
using AIGenVideo.Server.Infrastructure.Clients;
using AIGenVideo.Server.Services.ContentGenerate;

namespace AIGenVideo.Server.Bootstraping.ContentGenerate;
public class ApiKeysSettings
{
    public const string SectionName = "ApiKeys";
    public string YouTube { get; set; } = string.Empty;
    public string Gemini { get; set; } = string.Empty;
    public string Groq { get; set; } = string.Empty;
    // Add other API keys as needed
}
public static class ContentGenerateServerExtension
{

    public static IServiceCollection AddContentGenerateServices(this IServiceCollection services, IConfiguration configuration)
    {
        // 1. Đăng ký Options Pattern cho API Keys (liên quan đến chức năng này)
        services.Configure<ApiKeysSettings>(configuration.GetSection(ApiKeysSettings.SectionName));

        services.AddHttpClient<IYouTubeClient, YouTubeClient>(client =>
        {
            client.BaseAddress = new Uri("https://www.googleapis.com/youtube/v3/");
            client.Timeout = TimeSpan.FromSeconds(30);
        });

        services.AddHttpClient<IGeminiClient, GeminiClient>((serviceProvider, client) =>
        {
            var config = serviceProvider.GetRequiredService<IConfiguration>();
            client.BaseAddress = new Uri("https://generativelanguage.googleapis.com/v1beta/");
            client.Timeout = TimeSpan.FromSeconds(30);
        });

        services.AddHttpClient<IGroqClient, GroqClient>((serviceProvider, client) =>
        {
            var config = serviceProvider.GetRequiredService<IConfiguration>();
            client.BaseAddress = new Uri("https://api.groq.com/");
            client.Timeout = TimeSpan.FromSeconds(30);
        });

        // Add HttpClient for Wikipedia
        services.AddHttpClient<WikipediaStrategy>(client =>
        {
            client.BaseAddress = new Uri("https://en.wikipedia.org/");
            client.Timeout = TimeSpan.FromSeconds(30);
        });

        // 3. Đăng ký các Service và Strategy của chức năng
        services.AddScoped<IMainContentGenerationService, MainContentGenerationService>();
        services.AddScoped<IContentGenerationStrategy, YouTubeStrategy>();
        services.AddScoped<IContentGenerationStrategy, GeminiStrategy>();
        services.AddScoped<IContentGenerationStrategy, GroqStrategy>();
        services.AddScoped<IContentGenerationStrategy, WikipediaStrategy>();
        // services.AddScoped<IContentGenerationStrategy, GuardianApiStrategy>();



        return services;
    }
}

