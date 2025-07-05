namespace AIGenVideo.Server.Services.SocialPlatform;

public class SocialPlatformFactory
{
    private readonly IServiceProvider _serviceProvider;

    public SocialPlatformFactory(IServiceProvider serviceProvider)
    {
        _serviceProvider = serviceProvider;
    }

    public IPlatformService Create(string platform)
    {
        return platform switch
        {
            Constants.YOUTUBE_PLATFORM_CODE => _serviceProvider.GetRequiredService<YouTubePlatformService>(),
            Constants.FACEBOOK_PLATFORM_CODE => _serviceProvider.GetRequiredService<FacebookPlatformService>(),
            Constants.TIKTOK_PLATFORM_CODE => _serviceProvider.GetRequiredService<TiktokPlatformService>(),
            _ => throw new ArgumentException($"Unknown platform: {platform}", nameof(platform))
        };
    }
}
