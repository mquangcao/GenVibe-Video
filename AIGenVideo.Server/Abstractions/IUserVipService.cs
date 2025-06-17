namespace AIGenVideo.Server.Abstractions;

public interface IUserVipService
{
    Task<(bool, string?)> UpgrateVipAsync(string userId, int duration);
}
