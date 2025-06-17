using Microsoft.AspNetCore.Authorization;
using Payment.Abstractions;
using Payment.Gateway.VnPay.Response;
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
    private readonly IPaymentService _paymentService;
    private readonly IUserVipService _userVipService;
    public PaymentController(UserManager<AppUser> userManager, IVipPlansRepository vipPlansRepository, ICurrentUserService currentUserService, ILogger<PaymentController> logger, ApplicationDbContext context, IPaymentGatewayFactory paymentGatewayFactory, IPaymentService paymentService, IUserVipService userVipService)
    {
        _userManager = userManager;
        _vipPlansRepository = vipPlansRepository;
        _currentUserService = currentUserService;
        _logger = logger;
        _context = context;
        _paymentGatewayFactory = paymentGatewayFactory;
        _paymentService = paymentService;
        _userVipService = userVipService;
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
            if (!urlResponse.Success)
            {
                return BadRequest(ApiResponse.FailResponse(urlResponse.ErrorMessage ?? "Create Url Error"));
            }
            var userId = _currentUserService.UserId;
            await _paymentService.CreatePaymentAsync(userId ?? "", plan.OriginalPrice - plan.Savings, requestPay.OrderId, requestPay.Gateway, requestPay.OrderDescription, plan.Id, request.ReturnUrl);

            return Ok(ApiResponse<PaymentUrlResult>.SuccessResponse(urlResponse));

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
    public async Task<IActionResult> VnPayReturn()
    {
        try
        {
            var returnModel = new PaymentResponse();
            var query = Request.Query;
            var callbackData = query.ToDictionary(kv => kv.Key, kv => kv.Value.ToString());

            var paymentGateway = _paymentGatewayFactory.Create(Constants.VNPAY_GATEWAY);
            var response = await paymentGateway.ProcessCallbackAsync(callbackData);
            if (!response.Success)
            {
                _logger.LogError("VnPay callback processing failed: {ErrorMessage}", response.Message);
                return BadRequest(ApiResponse.FailResponse(response.Message ?? "Failed to process VnPay callback"));
            }

            await using var transaction = await _context.Database.BeginTransactionAsync();

            var updateResult = await _paymentService.UpdatePaymentStatusAsync(response.OrderId, PaymentStatus.SUCCESS, response.Message, DateTime.UtcNow);

            if (!updateResult.IsSuccess)
            {
                _logger.LogError("Failed to update payment status: {Message}", updateResult.Message);
                return BadRequest(ApiResponse.FailResponse(updateResult.Message ?? "Failed to update payment status"));
            }
            else
            {
                var plan = await _context.VipPlans.Where(v => v.Id == updateResult.PackageId).FirstOrDefaultAsync();
                if (plan == null)
                {
                    _logger.LogError("Plan not found for package ID: {PackageId}", updateResult.PackageId);
                    return BadRequest(ApiResponse.FailResponse("Plan not found for the specified package ID."));
                }
                returnModel.Name = plan.Name;
                returnModel.Price = plan.OriginalPrice - plan.Savings;
                returnModel.PaymentMethod = Constants.VNPAY_GATEWAY;
                var (isUpgrate, errorMsg) = await _userVipService.UpgrateVipAsync(updateResult.UserId ?? "", plan.DurationInMonths);
                if (!isUpgrate)
                {
                    _logger.LogError("Failed to upgrade VIP: {ErrorMessage}", errorMsg);
                    return BadRequest(ApiResponse.FailResponse(errorMsg ?? "Failed to upgrade VIP"));
                }
            }

            await transaction.CommitAsync();
            var returnUrl = updateResult.ReturnUrl;
            if (string.IsNullOrEmpty(returnUrl))
            {
                return NoContent();
            }
            if (returnUrl.EndsWith("/"))
            {
                returnUrl = returnUrl.Remove(returnUrl.Length - 1, 1);
            }

            return Redirect($"{updateResult.ReturnUrl}?{returnModel.ToQueryString()}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error processing VnPay return");
            return StatusCode(Constants.SERVER_ERROR_CODE, ApiResponse.FailResponse(Constants.MESSAGE_SERVER_ERROR));
        }
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
