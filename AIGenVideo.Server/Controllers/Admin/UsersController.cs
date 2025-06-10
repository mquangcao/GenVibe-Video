using AIGenVideo.Server.Models.ResponseModels.Admin;
using Microsoft.AspNetCore.Authorization;

namespace AIGenVideo.Server.Controllers.Admin;

[Authorize(Roles = "admin")]
[Route("api/admin/[controller]")]
public class UsersController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;
    public UsersController(UserManager<AppUser> userManager)
    {
        _userManager = userManager;
    }
    [HttpGet]
    public async Task<IActionResult> GetAllUsers([FromQuery] FilterParams request)
    {
        try
        {
            var query = _userManager.Users.AsQueryable();
            if (!string.IsNullOrEmpty(request.SearchTerm))
            {
                query = query.Where(u =>
                        (!string.IsNullOrEmpty(u.FullName) && u.FullName.Contains(request.SearchTerm)) ||
                        (!string.IsNullOrEmpty(u.Email) && u.Email.Contains(request.SearchTerm))
                    );
            }

            if (!string.IsNullOrEmpty(request.SortBy))
            {
                var sortFields = new Dictionary<string, string>(StringComparer.OrdinalIgnoreCase)
                {
                    { "name", "FullName" },
                    { "email", "Email" }
                };

                if (!sortFields.TryGetValue(request.SortBy, out var sortBy))
                {
                    sortBy = "Name";
                }

                query = request.SortDirection.Equals("desc", StringComparison.CurrentCultureIgnoreCase)
                    ? query.OrderByDescending(u => EF.Property<object>(u, sortBy))
                    : query.OrderBy(u => EF.Property<object>(u, sortBy));
            }
            var totalCount = await query.CountAsync();

            query = query
                .Skip(request.PageSize * (request.PageIndex - 1))
                .Take(request.PageSize);

            var users = await query.ToListAsync();
            var userList = new List<UserListResponse>();

            foreach (var u in users)
            {
                var role = (await _userManager.GetRolesAsync(u)).FirstOrDefault() ?? Constants.USER_ROLE;

                userList.Add(new UserListResponse
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email,
                    Role = role,
                    VipExpries = DateTime.UtcNow.AddDays(7).ToString("yyyy-MM-dd HH:mm:ss")
                });
            }

            var data = new PaginationResponse<UserListResponse>()
            {
                Items = userList,
                Count = totalCount,
                PageSize = request.PageSize,
                PageIndex = request.PageIndex
            };
            return Ok(ApiResponse<PaginationResponse<UserListResponse>>.SuccessResponse(data));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse.FailResponse($"An error occurred: {ex.Message}"));
        }
    }
    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserById(string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
        {
            return NotFound(ApiResponse.FailResponse("Can't find user"));
        }
        return Ok(ApiResponse<AppUser>.SuccessResponse(user));
    }
}
