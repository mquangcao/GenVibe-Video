using AIGenVideo.Server.Models.ResponseModels.Admin;
using Microsoft.AspNetCore.Authorization;

namespace AIGenVideo.Server.Controllers.Admin;

[Authorize(Roles = "admin")]
[Route("api/admin/[controller]")]
public class UsersController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;
    private readonly IRoleRepository _roleRepository;
    public UsersController(UserManager<AppUser> userManager, IRoleRepository roleRepository)
    {
        _userManager = userManager;
        _roleRepository = roleRepository;
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

            if (!string.IsNullOrEmpty(request.Id))
            {
                query = query.Where(u => u.Id == request.Id);
            }

            if (!string.IsNullOrEmpty(request.Email))
            {
                query = query.Where(u => !string.IsNullOrEmpty(u.Email) && u.Email.Contains(request.Email));
            }

            if (!request.LockoutEnable.Equals("all", StringComparison.CurrentCultureIgnoreCase))
            {
                var dir = new Dictionary<string, bool>() {
                    {"locked", false },
                    {"active", true }
                };
                if (!dir.TryGetValue(request.LockoutEnable, out var isLocked))
                {
                    return BadRequest(ApiResponse.FailResponse("Invalid lockout status"));
                }
                
                query = query.Where(u => u.LockoutEnabled == isLocked);
            }
            

            if (!request.Role.Equals("all", StringComparison.CurrentCultureIgnoreCase))
            {
                var usersRole = await _roleRepository.GetUserIdsByRoleNameAsync(request.Role);

                if (usersRole.Any())
                {
                    query = query.Where(u => usersRole.Contains(u.Id));
                }
                else
                {
                    query = query.Where(u => false);
                }

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
                    VipExpries = DateTime.UtcNow.AddDays(7).ToString("yyyy-MM-dd HH:mm:ss"),
                    IsLocked = !u.LockoutEnabled
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
