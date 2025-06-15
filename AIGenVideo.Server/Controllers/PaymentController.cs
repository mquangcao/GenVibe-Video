using AIGenVideo.Server.Models.DomainModels;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Net.WebSockets;

namespace AIGenVideo.Server.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "user,vip,admin")]
public class PaymentController : ControllerBase
{
    private readonly UserManager<AppUser> _userManager;
    private readonly IVipPlansRepository _vipPlansRepository;
    private readonly ICurrentUserService _currentUserService;
    private readonly ILogger<PaymentController> _logger;
    private readonly ApplicationDbContext _context;
    public PaymentController(UserManager<AppUser> userManager, IVipPlansRepository vipPlansRepository, ICurrentUserService currentUserService, ILogger<PaymentController> logger, ApplicationDbContext context)
    {
        _userManager = userManager;
        _vipPlansRepository = vipPlansRepository;
        _currentUserService = currentUserService;
        _logger = logger;
        _context = context;
        // Constructor logic if needed
    }

    [HttpPost] 
    public async Task<IActionResult> ProcessPayment([FromBody] PaymentRequest request)
    {
        if (request == null || !ModelState.IsValid)
        {
            return BadRequest("Invalid payment request");
        }

        var username = HttpContext.User.GetUsername();
        if (string.IsNullOrEmpty(username))
        {
            return Unauthorized("User not authenticated");
        }
        var user = await _userManager.FindByNameAsync(username);
        // Here you would typically call a payment processing service
        // For demonstration, we will just return a success response
        return Ok();
    }

    [HttpGet("checkout/{duration}")]
    public async Task<IActionResult> Checkout([FromRoute] int duration)
    {
        try
        {
            var plan = await _context.VipPlans.Where(v => v.DurationInMonths == duration).FirstOrDefaultAsync();
            if (plan == null)
            {
                return BadRequest(ApiResponse.FailResponse("Invalid plan duration specified."));
            }


            var (isVip, expirationDate) = await _currentUserService.GetVipExpiryDateAsync();
            if (!isVip)
            {
                expirationDate = DateTimeOffset.UtcNow;
            }

            return Ok(ApiResponse.SuccessResponse(new
            {
                Name = plan.Name,
                Price = plan.OriginalPrice - plan.Savings,
                Period = plan.Period,
                Savings = plan.Savings,
                OriginalPrice = plan.OriginalPrice,
                PlanType = $"{plan.Period}ly",
                NextBillingDate = expirationDate.AddMonths(duration)
            }));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error during checkout process");
            return StatusCode(Constants.SERVER_ERROR_CODE, ApiResponse.FailResponse(Constants.MESSAGE_SERVER_ERROR));
        }
    }

    [HttpGet]
    [Route("plans")]
    public async Task<IActionResult> GetVipPlans()
    {
        var isVip = false;
        try
        {
            var userId = _currentUserService.UserId;
            if (string.IsNullOrEmpty(userId))
            {
                return BadRequest(ApiResponse.FailResponse("User ID is required."));
            }
            var expirationDate = await _context.UserVipSubscriptions.Where(u => u.UserId == userId)
                .OrderByDescending(u => u.ExpirationDate)
                .Select(u => new
                {
                    ExpirationDate = (DateTimeOffset?)u.ExpirationDate,
                    StartDate = (DateTimeOffset?)u.StartDate
                })
                .FirstOrDefaultAsync();
            if (expirationDate is not null)
            {
                isVip = true;
            }
            return Ok(ApiResponse.SuccessResponse(new
            {
                isVip,
                expirationDate?.ExpirationDate,
                expirationDate?.StartDate
            }));
        }
        catch (Exception)
        {
            return StatusCode(Constants.SERVER_ERROR_CODE, ApiResponse.FailResponse(Constants.MESSAGE_SERVER_ERROR));
        }
        
    }
}
