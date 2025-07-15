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
            var platformCodes = new[] {
                Constants.YOUTUBE_PLATFORM_CODE,
                Constants.TIKTOK_PLATFORM_CODE,
                Constants.FACEBOOK_PLATFORM_CODE
            };
            var platformInfos = new List<PlatformInfo>();
            foreach (var code in platformCodes)
            {
                var platform = _socialPlatformFactory.Create(code);
                var info = await platform.GetPlatFormInfo();
                if (info != null)
                {
                    platformInfos.Add(info);
                }
            }


            return Ok(ApiResponse<List<PlatformInfo>>.SuccessResponse(platformInfos));
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
