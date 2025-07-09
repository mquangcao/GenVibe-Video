namespace AIGenVideo.Server.Abstractions
{
    public interface ICurrentUserService
    {
        string? UserId { get; }
        string? IpAddress { get; }
        Task<(bool isVip, DateTimeOffset expirationDate)> GetVipExpiryDateAsync();
    }
}
