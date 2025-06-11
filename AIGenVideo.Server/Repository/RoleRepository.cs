namespace AIGenVideo.Server.Repository;

public class RoleRepository : IRoleRepository
{
    private readonly ApplicationDbContext _context;
    public RoleRepository(ApplicationDbContext context)
    {
        _context = context;
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
}
