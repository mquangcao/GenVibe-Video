using AIGenVideo.Server.Models.DomainModels;
using AIGenVideo.Server.Services.SocialPlatform;
using Microsoft.AspNetCore.Authorization;

namespace AIGenVideo.Server.Controllers.SocialPlatform;
[Route("api/social-platform")]
[Authorize]
public class PlatformInfoController : Controller
{
    private readonly SocialPlatformFactory _socialPlatformFactory;
    public PlatformInfoController(SocialPlatformFactory socialPlatformFactory)
    {
        _socialPlatformFactory = socialPlatformFactory;
    }

    [HttpGet("connections")]
    public async Task<IActionResult> GetAllPlatform()
    {
        try
        {
            var youtubePlatform = _socialPlatformFactory.Create("youtube");
            var tiktokPlatform = _socialPlatformFactory.Create("tiktok");
            var facebookPlatform = _socialPlatformFactory.Create("facebook");
            var youtubeInfo = await youtubePlatform.GetPlatFormInfo();
            var tiktokInfo = await tiktokPlatform.GetPlatFormInfo();
            var facebookInfo = await facebookPlatform.GetPlatFormInfo();

            return Ok(ApiResponse<List<PlatformInfo>>.SuccessResponse([youtubeInfo, tiktokInfo, facebookInfo]));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse.FailResponse(ex.Message));
        }
    }

    [HttpGet("{platform}/info")]
    public async Task<IActionResult> GetPlatFormInfo(string platform)
    {
        try
        {
            var socialPlatform = _socialPlatformFactory.Create(platform);
            var platformInfo = await socialPlatform.GetPlatFormInfo();

            return Ok(ApiResponse<PlatformInfo>.SuccessResponse(platformInfo));
        }
        catch (Exception ex)
        {
            return BadRequest(ApiResponse.FailResponse(ex.Message));
        }
    }
}
