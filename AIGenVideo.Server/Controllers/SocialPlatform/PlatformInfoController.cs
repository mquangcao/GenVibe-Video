namespace AIGenVideo.Server.Controllers.SocialPlatform;
[Route("api/social-platform")]

public class PlatformInfoController : Controller
{
    private readonly IPlatformService _platformService;
    public PlatformInfoController(IPlatformService platformService)
    {
        _platformService = platformService;
    }
    [HttpGet("channel-name")]
    public async Task<IActionResult> GetChannelNameAsync()
    {
        var channelName = await _platformService.GetChannelNameAsync();
        var sub = await _platformService.GetSubscriberCountAsync();
        var videoCount = await _platformService.GetVideoCountAsync();

        return Ok(ApiResponse.SuccessResponse(new
        {
            ChannelName = channelName,
            SubscriberCount = sub,
            VideoCount = videoCount
        }));
    }
}
