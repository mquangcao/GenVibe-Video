using System.Security.Claims;

namespace AIGenVideo.Server.Services;

public class CurrentUserService : ICurrentUserService
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly ApplicationDbContext _context;

    public CurrentUserService(IHttpContextAccessor httpContextAccessor, ApplicationDbContext context)
    {
        _httpContextAccessor = httpContextAccessor;
        _context = context;
    }
    public string? UserId => _httpContextAccessor?.HttpContext?.User.FindFirstValue(ClaimTypes.NameIdentifier);

    public string? IpAddress => _httpContextAccessor?.HttpContext?.Connection?.LocalIpAddress?.MapToIPv4().ToString();

    public async Task<(bool, DateTimeOffset)>  GetVipExpiryDateAsync()
    {
        try
        {
            var userId = UserId;
            if (string.IsNullOrEmpty(userId))
            {
                return (false, DateTimeOffset.MinValue);
            }
            var expirationDate = await _context.UserVipSubscriptions.Where(u => u.UserId == userId)
                .OrderByDescending(u => u.ExpirationDate)
                .Select(u => (DateTimeOffset?)u.ExpirationDate)
                .FirstOrDefaultAsync();
            return expirationDate.HasValue
                    ? (true, expirationDate.Value)
                    : (false, DateTimeOffset.MinValue);
        }
        catch (Exception)
        {
            throw;
        }
    }
}
