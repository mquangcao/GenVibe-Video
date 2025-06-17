
namespace AIGenVideo.Server.Services;

public class UserVipService : IUserVipService
{
    private readonly ApplicationDbContext _context;
    private readonly IUserVipSubscriptionRepository _userVipSubscriptionRepository;

    public UserVipService(ApplicationDbContext context, IUserVipSubscriptionRepository userVipSubscriptionRepository)
    {
        _context = context;
        _userVipSubscriptionRepository = userVipSubscriptionRepository;
    }

    public async Task<(bool, string?)> UpgrateVipAsync(string userId, int duration)
    {
        try
        {
            var plan = await _context.VipPlans.Where(v => v.DurationInMonths == duration).FirstOrDefaultAsync();
            if (plan == null)
            {
                return (false, null);
            }

            var userVip = await _context.UserVipSubscriptions.FirstOrDefaultAsync(u => u.UserId == userId);
            if (userVip != null)
            {
                userVip.ExpirationDate = userVip.ExpirationDate.AddMonths(duration);
                _context.UserVipSubscriptions.Update(userVip);
            }
            else
            {
                userVip = new UserVipSubscription
                {
                    UserId = userId,
                    StartDate = DateTime.UtcNow,
                    ExpirationDate = DateTime.UtcNow.AddMonths(duration)
                };
                await _context.UserVipSubscriptions.AddAsync(userVip);
            }

            await _context.SaveChangesAsync();
            return (true, null);

        }
        catch (Exception ex)
        {
            return (false, ex.Message);
        }
    }
}
