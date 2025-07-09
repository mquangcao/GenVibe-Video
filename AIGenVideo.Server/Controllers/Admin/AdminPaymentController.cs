using AIGenVideo.Server.Models.ResponseModels.Admin;
using Microsoft.AspNetCore.Authorization;
using System.Linq.Expressions;

namespace AIGenVideo.Server.Controllers.Admin
{
    [Route("api/admin/payments")]
    [ApiController]
    [Authorize(Roles = "admin")]
    public class AdminPaymentController : ControllerBase
    {
        private readonly UserManager<AppUser> _userManager;
        private readonly ApplicationDbContext _context;

        public AdminPaymentController(UserManager<AppUser> userManager, ApplicationDbContext context)
        {
            _userManager = userManager;
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllPayments([FromQuery] FilterParams request)
        {
            try
            {
                var query = _context.Payments.Include(p => p.User).Include(p => p.Package).AsQueryable();
                if (!string.IsNullOrEmpty(request.SearchTerm))
                {
                    query = query.Where(u =>
                            (!string.IsNullOrEmpty(u.User.UserName) && u.User.UserName.Contains(request.SearchTerm))
                        );
                }

                if (!string.IsNullOrEmpty(request.SortBy))
                {
                    Expression<Func<Data.Entities.Payment, object>> orderExpr = request.SortBy?.ToLower() switch
                    {
                        "email" => p => p.User.UserName ?? "",
                        "amount" => p => p.Amount,
                        "createdAt" => p => p.CreatedAt,
                        _ => p => p.Amount
                    };

                    query = request.SortDirection.Equals("desc", StringComparison.OrdinalIgnoreCase)
                        ? query.OrderByDescending(orderExpr)
                        : query.OrderBy(orderExpr);
                }

                if (!string.IsNullOrEmpty(request.Id))
                {
                    query = query.Where(u => u.PaymentId == request.Id);
                }

                if (!string.IsNullOrEmpty(request.Email))
                {
                    query = query.Where(u => !string.IsNullOrEmpty(u.User.Email) && u.User.Email.Contains(request.Email));
                }


                if (request.FromDate != null && request.ToDate != null)
                {
                    query = query.Where(u => u.CreatedAt >= request.FromDate && u.CreatedAt <= request.ToDate);
                }


                if (!request.Status.Equals("all", StringComparison.CurrentCultureIgnoreCase))
                {
                    query = query.Where(u => u.Status.ToLower() == request.Status.ToLower());
                }
                var totalCount = await query.CountAsync();

                query = query
                    .Skip(request.PageSize * (request.PageIndex - 1))
                    .Take(request.PageSize);

                var payments = await query.ToListAsync();
                var paymentsList = new List<PaymentInfoResponse>();

                payments.ForEach(payment =>
                {
                    paymentsList.Add(new PaymentInfoResponse
                    {
                        PaymentId = payment.PaymentId,
                        Email = payment.User.Email ?? "",
                        PackageName = payment.Package?.Name ?? "",
                        Amount = payment.Amount,
                        Gateway = payment.Gateway,
                        Status = payment.Status,
                        CreatedAt = payment.CreatedAt
                    });
                });

                var data = new PaginationResponse<PaymentInfoResponse>()
                {
                    Items = paymentsList,
                    Count = totalCount,
                    PageSize = request.PageSize,
                    PageIndex = request.PageIndex
                };
                return Ok(ApiResponse<PaginationResponse<PaymentInfoResponse>>.SuccessResponse(data));
            }
            catch (Exception ex)
            {
                return StatusCode(StatusCodes.Status500InternalServerError, ApiResponse.FailResponse($"An error occurred: {ex.Message}"));
            }
        }
    }
}
