namespace AIGenVideo.Server.Services;

public class SocialPlatformService : ISocialPlatformService
{
    private readonly ApplicationDbContext _context;

    public SocialPlatformService(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<UserSocialAccount?> GetAccountAsync(string userId, string platformCode)
    {
        return await _context.UserSocialAccounts
                .Include(a => a.Platform)
                .FirstOrDefaultAsync(a => a.UserId == userId && a.Platform.Code == platformCode && !a.IsRevoked);
    }

    public async Task<string?> GetAcessTokenAsync(string userId, string platformCode)
    {
        return await _context.UserSocialAccounts
            .Where(a => a.UserId == userId && a.Platform.Code == platformCode && !a.IsRevoked && a.TokenExpiry > DateTime.UtcNow)
            .Select(a => a.AccessToken)
            .FirstOrDefaultAsync();
    }

    public async Task<List<UserSocialAccount>> GetAllAccountsAsync(string userId)
    {
        return await _context.UserSocialAccounts
                .Include(a => a.Platform)
                .Where(a => a.UserId == userId && !a.IsRevoked)
                .ToListAsync();
    }

    public async Task<bool> IsTokenExpiredAsync(string userId, string platformCode)
    {
        var account = await GetAccountAsync(userId, platformCode);
        return account == null || account.TokenExpiry <= DateTime.UtcNow;
    }

    public async Task RevokeTokenAsync(string userId, string platformCode)
    {
        var account = await GetAccountAsync(userId, platformCode);
        if (account != null)
        {
            account.IsRevoked = true;
            await _context.SaveChangesAsync();
        }
    }

    public async Task SaveTokenAsync(string userId, string platformCode, string externalUserId, string displayName, string accessToken, string refreshToken, DateTime expiryTime, string scopes)
    {
        var platform = await _context.Platforms.FirstOrDefaultAsync(p => p.Code == platformCode) ?? throw new InvalidOperationException($"Platform '{platformCode}' not found.");
        var account = await _context.UserSocialAccounts
            .FirstOrDefaultAsync(a => a.UserId == userId && a.PlatformId == platform.Id);

        if (account == null)
        {
            account = new UserSocialAccount
            {
                UserId = userId,
                PlatformId = platform.Id,
                ExternalUserId = externalUserId,
                DisplayName = displayName,
                AccessToken = accessToken,
                RefreshToken = refreshToken,
                TokenExpiry = expiryTime,
                Scopes = scopes,
                ConnectedAt = DateTime.UtcNow
            };
            _context.UserSocialAccounts.Add(account);
        }
        else
        {
            account.AccessToken = accessToken;
            account.RefreshToken = refreshToken;
            account.DisplayName = displayName;
            account.ExternalUserId = externalUserId;
            account.TokenExpiry = expiryTime;
            account.Scopes = scopes;
            account.LastRefreshedAt = DateTime.UtcNow;
            account.IsRevoked = false;
        }

        await _context.SaveChangesAsync();
    }

    public async Task UpdateAccessTokenAsync(string userId, string platformCode, string newAccessToken, DateTime newExpiryTime)
    {
        var account = await GetAccountAsync(userId, platformCode) ?? throw new InvalidOperationException("Account not found");
        account.AccessToken = newAccessToken;
        account.TokenExpiry = newExpiryTime;
        account.LastRefreshedAt = DateTime.UtcNow;

        await _context.SaveChangesAsync();
    }
}
