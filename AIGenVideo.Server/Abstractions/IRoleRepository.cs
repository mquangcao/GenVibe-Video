namespace AIGenVideo.Server.Abstractions;

public interface IRoleRepository
{
    Task<string?> GetRoleIdByNameAsync(string roleName);
    Task<List<string>> GetUserIdsByRoleNameAsync(string roleName);
}
