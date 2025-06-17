namespace AIGenVideo.Server.Abstractions;

public interface IUserVipSubscriptionRepository
{
    Task<DateTimeOffset?> GetUserSubscriptionTimeAsync(string userId);
}
