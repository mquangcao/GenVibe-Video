using AIGenVideo.Server.Abstractions;
using AIGenVideo.Server.Models.Configurations;
using AIGenVideo.Server.Models.DomainModels;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.Extensions.Options;
using System.Security.Cryptography;
using System.Text;

namespace AIGenVideo.Server.Services.SocialPlatform;

public class TiktokPlatformService : IPlatformService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly IOAuthStateService _oAuthStateService;
    private readonly ILogger<TiktokPlatformService> _logger;
    private readonly TikTokOptions _tiktokOptions;
    public TiktokPlatformService(IHttpContextAccessor httpContextAccessor, IOAuthStateService oAuthStateService, ILogger<TiktokPlatformService> logger, IOptions<TikTokOptions> tiktokOptions)
    {
        _httpContextAccessor = httpContextAccessor;
        _oAuthStateService = oAuthStateService;
        _logger = logger;
        _tiktokOptions = tiktokOptions.Value;
    }


    private const long Result = 0L;

    public Task<string?> GetAccessToken()
    {
        return Task.FromResult<string?>(null);
    }

    public Task<string?> GetAvatarUrlAsync()
    {
        return Task.FromResult<string?>(null);

    }

    public Task<string?> GetChannelHandleAsync()
    {
        return Task.FromResult<string?>(null);
    }

    public Task<string?> GetChannelNameAsync()
    {
        return Task.FromResult<string?>(null);
    }

    public async Task<string?> GetOAuthUrl(string redirectUrl)
    {
        try
        {
            var state = Guid.NewGuid().ToString();
            var userId = _httpContextAccessor?.HttpContext?.User.GetUserId();

            if (string.IsNullOrEmpty(userId))
            {
                throw new UnauthorizedAccessException("User is not authenticated.");
            }

            // Tạo code_verifier
            var codeVerifier = GenerateCodeVerifier();
            var codeChallenge = GenerateCodeChallenge(codeVerifier);

            // Lưu cả userId và code_verifier vào Redis
            await _oAuthStateService.SetStateAsync(state, new OAuthStateData
            {
                UserId = userId,
                CodeVerifier = codeVerifier
            });

            var url = QueryHelpers.AddQueryString("https://www.tiktok.com/v2/auth/authorize", new Dictionary<string, string?>
            {
                ["client_key"] = _tiktokOptions.ClientId,
                ["redirect_uri"] = redirectUrl,
                ["response_type"] = "code",
                ["scope"] = "user.info.basic,video.list",
                ["state"] = state,
                ["code_challenge"] = codeChallenge,
                ["code_challenge_method"] = "S256"
            });

            return url;
        }
        catch (Exception ex)
        {
            _logger.LogError("Error generating OAuth URL: {Message}", ex.Message);
            return null;
        }
    }

    private string GenerateCodeVerifier()
    {
        var bytes = RandomNumberGenerator.GetBytes(64);
        return Convert.ToBase64String(bytes)
            .TrimEnd('=').Replace('+', '-').Replace('/', '_');
    }

    private string GenerateCodeChallenge(string codeVerifier)
    {
        var bytes = Encoding.ASCII.GetBytes(codeVerifier);
        using var sha256 = SHA256.Create();
        var hash = sha256.ComputeHash(bytes);
        return Convert.ToBase64String(hash)
            .TrimEnd('=').Replace('+', '-').Replace('/', '_');
    }

    public Task<PlatformInfo> GetPlatFormInfo()
    {
        return Task.FromResult<PlatformInfo>(new PlatformInfo()
        {
            PlatformCode = Constants.TIKTOK_PLATFORM_CODE,
            IsConnecting = false,

        });

    }

    public Task<int> GetSubscriberCountAsync()
    {
        return Task<int>.FromResult(0);
    }

    public Task<int> GetVideoCountAsync()
    {
        return Task<int>.FromResult(0);

    }

    public Task<long> GetViewCountAsync()
    {
        return Task<long>.FromResult(Result);
    }

    public Task<PlatformRedirectResult> HandlePlatformRedirectAsync(string code, string state, string redirectUrl)
    {
        throw new NotImplementedException();
    }
}
