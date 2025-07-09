namespace AIGenVideo.Server.Abstractions;

public interface ISocialPlatformService
{
    Task SaveTokenAsync(
        string userId,
        string platformCode,
        string externalUserId,
        string displayName,
        string accessToken,
        string refreshToken,
        DateTime expiryTime,
        string scopes);

    Task UpdateAccessTokenAsync(
        string userId,
        string platformCode,
        string newAccessToken,
        DateTime newExpiryTime);

    Task RevokeTokenAsync(string userId, string platformCode);
    Task<bool> IsTokenExpiredAsync(string userId, string platformCode);
    Task<List<UserSocialAccount>> GetAllAccountsAsync(string userId);
    Task<UserSocialAccount?> GetAccountAsync(string userId, string platformCode);
    Task<string?> GetAcessTokenAsync(string userId, string platformCode);
    Task<string?> GetRefreshTokenAsync(string userId, string platformCode);

}
