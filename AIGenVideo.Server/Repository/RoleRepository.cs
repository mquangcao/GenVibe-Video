
namespace AIGenVideo.Server.Repository;

public class RoleRepository : IRoleRepository
{
    private readonly ApplicationDbContext _context;
    private readonly UserManager<AppUser> _userManager;
    public RoleRepository(ApplicationDbContext context, UserManager<AppUser> userManager)
    {
        _context = context;
        _userManager = userManager;
    }

    public async Task AssignVipRoleAsync(AppUser user, DateTime expiryTime)
    {
        try
        {
            var roles = await _userManager.GetRolesAsync(user);

            if (!roles.Contains(Constants.VIP_ROLE))
            {
                if (roles.Any())
                {
                    var removeResult = await _userManager.RemoveFromRolesAsync(user, roles);
                    if (!removeResult.Succeeded)
                    {
                        // Log lỗi hoặc throw tùy nghiệp vụ
                        throw new Exception("Failed to remove existing roles.");
                    }
                }

                var addResult = await _userManager.AddToRoleAsync(user, Constants.VIP_ROLE);
                if (!addResult.Succeeded)
                {
                    throw new Exception("Failed to add VIP role.");
                }
            }

            var existingSubscription = await _context.UserVipSubscriptions
                .FirstOrDefaultAsync(s => s.UserId == user.Id && s.ExpirationDate > DateTime.UtcNow);

            if (existingSubscription != null)
            {
                existingSubscription.ExpirationDate = expiryTime;
            }
            else
            {
                await _context.UserVipSubscriptions.AddAsync(new UserVipSubscription
                {
                    UserId = user.Id,
                    StartDate = DateTime.UtcNow,
                    ExpirationDate = expiryTime
                });
            }

            await _context.SaveChangesAsync();
        }
        catch (Exception)
        {
            // Log lỗi nếu có system logger (Serilog, NLog, v.v.)
            // _logger.LogError(ex, "Lỗi khi gán role VIP cho user");

            throw; // hoặc return kết quả tùy nghiệp vụ
        }
    }


    public async Task<string?> GetRoleIdByNameAsync(string roleName)
    {
        return await _context.Roles
            .Where(r => !string.IsNullOrEmpty(r.Name) && roleName.ToUpper() == r.NormalizedName)
            .Select(r => r.Id)
            .FirstOrDefaultAsync();
    }

    public async Task<List<string>> GetUserIdsByRoleNameAsync(string roleName)
    {
        var roleId = await GetRoleIdByNameAsync(roleName);

        if (string.IsNullOrEmpty(roleId))
        {
            return [];
        }

        return await _context.UserRoles
            .Where(ur => ur.RoleId == roleId)
            .Select(ur => ur.UserId)
            .ToListAsync();
    }

    public async Task<DateTime?> GetVipExpiryTimeAsync(string userId)
    {
        try
        {
            return await _context.UserVipSubscriptions
                .Where(s => s.UserId == userId && s.ExpirationDate > DateTime.UtcNow)
                .OrderByDescending(s => s.ExpirationDate)
                .Select(s => (DateTime?)s.ExpirationDate)
                .FirstOrDefaultAsync();
        }
        catch (Exception)
        {
            throw;
        }
    }

    public async Task<bool> RoleExistsAsync(string roleName)
    {
        return await _context.Roles.AnyAsync(r => !string.IsNullOrEmpty(r.Name) && roleName.ToUpper() == r.NormalizedName);
    }
}
