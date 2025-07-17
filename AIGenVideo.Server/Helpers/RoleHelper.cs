namespace AIGenVideo.Server.Helpers;

public class RoleHelper
{
    private static readonly List<string> RolePriority = new() { Constants.ADMIN_ROLE, Constants.VIP_ROLE, Constants.USER_ROLE };

    /// <summary>
    /// Trả về role cao nhất của user dựa trên danh sách role hiện có
    /// </summary>
    /// <param name="userRoles">Danh sách các role mà user đang có</param>
    /// <returns>Role cao nhất</returns>
    public static string GetHighestRole(List<string> userRoles)
    {
        foreach (var role in RolePriority)
        {
            if (userRoles.Contains(role, StringComparer.OrdinalIgnoreCase))
            {
                return role;
            }
        }

        // Nếu không có role nào khớp thì trả về "Unknown"
        return Constants.USER_ROLE;
    }
}
