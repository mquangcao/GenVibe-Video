using Microsoft.AspNetCore.Authorization;
using Payment.Abstractions;
using Payment.Models;

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
    private readonly IPaymentGatewayFactory _paymentGatewayFactory;
    private readonly ApplicationDbContext _context;
    public PaymentController(UserManager<AppUser> userManager, IVipPlansRepository vipPlansRepository, ICurrentUserService currentUserService, ILogger<PaymentController> logger, ApplicationDbContext context, IPaymentGatewayFactory paymentGatewayFactory)
    {
        _userManager = userManager;
        _vipPlansRepository = vipPlansRepository;
        _currentUserService = currentUserService;
        _logger = logger;
        _context = context;
        _paymentGatewayFactory = paymentGatewayFactory;
        // Constructor logic if needed
    }

    [HttpPost]
    public async Task<IActionResult> ProcessPayment([FromBody] Models.RequestModels.PaymentRequest request)
    {
        if (!ModelState.IsValid)
        {
            return BadRequest("Invalid payment request");
        }

        try
        {
            var plan = await _context.VipPlans.Where(v => v.DurationInMonths == request.DurationMonths).FirstOrDefaultAsync();
            if (plan == null)
            {
                return BadRequest(ApiResponse.FailResponse("Invalid plan duration specified."));
            }

            var requestPay = new Payment.Models.PaymentRequest()
            {
                OrderId = Guid.NewGuid().ToString("N"),
                Amount = Convert.ToInt64(plan.OriginalPrice - plan.Savings),
                OrderDescription = $"VIP_ACCESS_{plan.Name}",
                Gateway = request.GateWay,
                IpAddress = $"{Request?.Scheme}://{Request?.Host}"
            };

            var paymentGateway = _paymentGatewayFactory.Create(request.GateWay);
            var urlResponse = await paymentGateway.CreatePaymentUrlAsync(requestPay);

            if (urlResponse.Success)
            {
                return Ok(ApiResponse<PaymentUrlResult>.SuccessResponse(urlResponse));
            }
            return BadRequest(urlResponse);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing payment request");
            return StatusCode(Constants.SERVER_ERROR_CODE, ApiResponse.FailResponse(Constants.MESSAGE_SERVER_ERROR));
        }
    }

    [HttpGet("momo-return")]
    public IActionResult MomoReturn()
    {
        return Ok();
    }
    [AllowAnonymous]    
    [HttpGet("vnpay-return")]
    public IActionResult VnPayReturn()
    {
        return Ok();
    }
    [AllowAnonymous]
    [HttpPost("momo-ipn")]
    public IActionResult MomoIpn()
    {
        _logger.LogError("QUANG CAO HEHE AE momo");
        return Ok();
    }
    
    [AllowAnonymous]
    [HttpPost("vnpay-ipn")]
    public IActionResult VnPayIpn()
    {
        _logger.LogError("QUANG CAO HEHE AE vnpay");
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
