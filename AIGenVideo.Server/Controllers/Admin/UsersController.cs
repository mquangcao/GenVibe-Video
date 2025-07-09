using AIGenVideo.Server.Models.RequestModels.Admin;
using AIGenVideo.Server.Models.ResponseModels.Admin;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

namespace AIGenVideo.Server.Controllers.Admin;

[Authorize(Roles = "admin")]
[Route("api/admin/[controller]")]
public class UsersController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;
    private readonly IRoleRepository _roleRepository;
    private readonly ApplicationDbContext _context;
    public UsersController(UserManager<AppUser> userManager, IRoleRepository roleRepository, ApplicationDbContext context)
    {
        _userManager = userManager;
        _roleRepository = roleRepository;
        _context = context;
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
            var userList = new List<UserInfoResponse>();

            foreach (var u in users)
            {
                var role = (await _userManager.GetRolesAsync(u)).FirstOrDefault() ?? Constants.USER_ROLE;
                var expires = await _roleRepository.GetVipExpiryTimeAsync(u.Id);

                userList.Add(new UserInfoResponse
                {
                    Id = u.Id,
                    FullName = u.FullName,
                    Email = u.Email ?? "" ,
                    Role = role,
                    VipExpries = expires,
                    IsLocked = !u.LockoutEnabled
                });
            }

            var data = new PaginationResponse<UserInfoResponse>()
            {
                Items = userList,
                Count = totalCount,
                PageSize = request.PageSize,
                PageIndex = request.PageIndex
            };
            return Ok(ApiResponse<PaginationResponse<UserInfoResponse>>.SuccessResponse(data));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse.FailResponse($"An error occurred: {ex.Message}"));
        }
    }
    [HttpGet("{id}")]
    public async Task<IActionResult> GetUserById([FromRoute] string id)
    {
        var user = await _userManager.FindByIdAsync(id);
        if (user == null)
        {
            return BadRequest(ApiResponse.FailResponse("User not found"));
        }

        var role = (await _userManager.GetRolesAsync(user)).FirstOrDefault() ?? Constants.USER_ROLE;
        var expires = await _roleRepository.GetVipExpiryTimeAsync(user.Id);
        var userInfo = new UserInfoResponse
        {
            Id = user.Id,
            FullName = user.FullName,
            Email = user.Email ?? "",
            Role = role,
            VipExpries = expires,
            IsLocked = !user.LockoutEnabled
        };

        return Ok(ApiResponse<UserInfoResponse>.SuccessResponse(userInfo));
    }

    [HttpPost]
    public async Task<IActionResult> CreateUser([FromBody] CreateUserRequest request)
    {
        try
        {
            var user = new AppUser
            {
                UserName = request.Email,
                Email = request.Email,
                FullName = request.FullName,
            };

            var result = await _userManager.CreateAsync(user, request.Password);
            if (!result.Succeeded)
            {
                return BadRequest(ApiResponse.FailResponse(string.Join(", ", result.Errors.Select(e => e.Description))));
            }
            if (!string.IsNullOrEmpty(request.Role))
            {
                var roleExists = await _roleRepository.RoleExistsAsync(request.Role);
                if (!roleExists)
                {
                    return BadRequest(ApiResponse.FailResponse("Role does not exist"));
                }
                await _userManager.AddToRoleAsync(user, request.Role);

                if (request.Role.Equals(Constants.VIP_ROLE, StringComparison.OrdinalIgnoreCase))
                {
                    await _roleRepository.AssignVipRoleAsync(user, request.VipExpires ?? DateTime.UtcNow.AddDays(7));
                }
            }
            return StatusCode(StatusCodes.Status201Created, ApiResponse<AppUser>.SuccessResponse(null, "Created user successfully"));
        }
        catch (Exception ex)
        {
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse.FailResponse($"An error occurred: {ex.Message}"));
        }
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> UpdateUser([FromRoute] string id, [FromBody] UpdateUserRequest request)
    {
        using var transaction = await _context.Database.BeginTransactionAsync();

        try
        {
            var user = await _userManager.FindByIdAsync(id);
            if (user == null)
            {
                return BadRequest(ApiResponse.FailResponse("User not found"));
            }
            if (!string.IsNullOrEmpty(request.FullName))
            {
                user.FullName = request.FullName;
            }
            if (!string.IsNullOrEmpty(request.Email))
            {
                user.Email = request.Email;
                user.UserName = request.Email;
            }

            user.LockoutEnabled = !request.IsLocked;

            var result = await _userManager.UpdateAsync(user);
            if (!result.Succeeded)
            {
                return BadRequest(ApiResponse.FailResponse(string.Join(", ", result.Errors.Select(e => e.Description))));
            }
            if (!string.IsNullOrEmpty(request.Role))
            {
                var roleExists = await _roleRepository.RoleExistsAsync(request.Role);
                if (!roleExists)
                {
                    return BadRequest(ApiResponse.FailResponse("Role does not exist"));
                }
                var currentRoles = await _userManager.GetRolesAsync(user);
                if (currentRoles.Any())
                {
                    await _userManager.RemoveFromRolesAsync(user, currentRoles);
                }
                await _userManager.AddToRoleAsync(user, request.Role);
                if (request.Role.Equals(Constants.VIP_ROLE, StringComparison.OrdinalIgnoreCase))
                {
                    await _roleRepository.AssignVipRoleAsync(user, request.VipExpires ?? DateTime.UtcNow.AddDays(7));
                }
            }
            await transaction.CommitAsync();
            return Ok(ApiResponse<AppUser>.SuccessResponse(user, "Updated user successfully"));
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse.FailResponse($"An error occurred: {ex.Message}"));
        }
    }
}
