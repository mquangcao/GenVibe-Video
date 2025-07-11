
using Microsoft.AspNetCore.Identity;

namespace AIGenVideo.Server.Services;

public class UserVipService : IUserVipService
{
    private readonly ApplicationDbContext _context;
    private readonly IUserVipSubscriptionRepository _userVipSubscriptionRepository;
    private readonly UserManager<AppUser> _userManager;

    public UserVipService(ApplicationDbContext context, IUserVipSubscriptionRepository userVipSubscriptionRepository, UserManager<AppUser> userManager)
    {
        _context = context;
        _userVipSubscriptionRepository = userVipSubscriptionRepository;
        _userManager = userManager;
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

            var user = await _userManager.FindByIdAsync(userId);
            if (user == null)
            {
                return (false, "Người dùng không tồn tại.");
            }

            var isInVipRole = await _userManager.IsInRoleAsync(user, Constants.VIP_ROLE);
            if (!isInVipRole)
            {
                var result = await _userManager.AddToRoleAsync(user, Constants.VIP_ROLE);
                if (!result.Succeeded)
                {
                    return (false, "Không thể gán vai trò VIP.");
                }
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
