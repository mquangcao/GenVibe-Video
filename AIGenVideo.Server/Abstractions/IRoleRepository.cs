namespace AIGenVideo.Server.Abstractions;

public interface IRoleRepository
{
    Task<string?> GetRoleIdByNameAsync(string roleName);
    Task<List<string>> GetUserIdsByRoleNameAsync(string roleName);
    Task<bool> RoleExistsAsync(string roleName);
    Task AssignVipRoleAsync(AppUser user, DateTime expiryTime);
    Task<DateTime?> GetVipExpiryTimeAsync(string userId);
}
