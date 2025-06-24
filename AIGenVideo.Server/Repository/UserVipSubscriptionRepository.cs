
namespace AIGenVideo.Server.Repository;

public class UserVipSubscriptionRepository : IUserVipSubscriptionRepository
{
    private readonly ApplicationDbContext _context;

    public UserVipSubscriptionRepository(ApplicationDbContext context)
    {
        _context = context;
    }
    public async Task<DateTimeOffset?> GetUserSubscriptionTimeAsync(string userId)
    {
        try
        {
            var subscription = await _context.UserVipSubscriptions
            .Where(s => s.UserId == userId)
            .OrderByDescending(s => s.ExpirationDate)
            .Select(s => s.ExpirationDate)
            .FirstOrDefaultAsync();
            if (subscription == default)
            {
                return null;
            }

            return new DateTimeOffset(subscription, TimeSpan.Zero);
        }
        catch (Exception ex)
        {
            throw new Exception("An error occurred while retrieving the user subscription time.", ex);
        }
    }
}
