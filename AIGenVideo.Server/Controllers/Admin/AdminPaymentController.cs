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
                        CreatedAt = payment.CreatedAt,
                        Name = payment.User.FullName
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

        [HttpGet]
        [Route("summary")]
        public async Task<IActionResult> GetPaymentSummary()
        {
            var now = DateTime.UtcNow;
            var firstDayThisMonth = new DateTime(now.Year, now.Month, 1);
            var firstDayLastMonth = firstDayThisMonth.AddMonths(-1);
            var lastDayLastMonth = firstDayThisMonth.AddDays(-1);

            // Thống kê tháng này
            var payments = await _context.Payments
                .Where(p => p.CreatedAt >= firstDayThisMonth)
                .ToListAsync();

            var totalTransactions = payments.Count;
            var totalRevenue = payments.Where(p => p.Status == "success").Sum(p => p.Amount);
            var successCount = payments.Count(p => p.Status == "success");
            var successRate = totalTransactions > 0 ? Math.Round((double)successCount / totalTransactions * 100, 1) : 0;

            // Thống kê tháng trước để so sánh
            var lastMonthPayments = await _context.Payments
                .Where(p => p.CreatedAt >= firstDayLastMonth && p.CreatedAt <= lastDayLastMonth)
                .ToListAsync();

            var lastTotal = lastMonthPayments.Count;
            var lastRevenue = lastMonthPayments.Where(p => p.Status == "success").Sum(p => p.Amount);
            var lastSuccessCount = lastMonthPayments.Count(p => p.Status == "success");
            var lastSuccessRate = lastTotal > 0 ? (double)lastSuccessCount / lastTotal * 100 : 0;

            var compare = new
            {
                transactions = lastTotal == 0 ? 100.0 : Math.Round(((double)(totalTransactions - lastTotal) / lastTotal) * 100, 1),
                revenue = lastRevenue == 0 ? 100.0 : Math.Round(((double)((totalRevenue - lastRevenue) / lastRevenue)) * 100, 1),
                successRate = Math.Round(successRate - lastSuccessRate, 1)
            };

            // Thống kê theo gateway
            var gatewayDict = payments
                .GroupBy(p => p.Gateway)
                .ToDictionary(
                    g => string.IsNullOrEmpty(g.Key) ? "Khác" : g.Key,
                    g =>
                    {
                        var count = g.Count();
                        var amount = g.Where(p => p.Status == "success").Sum(p => p.Amount);
                        return new
                        {
                            count,
                            amount,
                            countPercentage = totalTransactions > 0
                                ? Math.Round(count * 100.0 / totalTransactions, 1)
                                : 0,
                            amountPercentage = totalRevenue > 0
                                ? Math.Round((double)amount * 100 / (double)totalRevenue, 1)
                                : 0
                        };
                    });

            // Thống kê theo trạng thái
            var byStatus = new[]
            {
                new { code = "success", label = "Thành công" },
                new { code = "pending", label = "Đang xử lý" },
                new { code = "failed", label = "Thất bại" },
                new { code = "expired", label = "Hết hạn" }
            }
            .Select(s =>
            {
                int count = 0;

                if (s.code == "expired")
                {
                    // Đếm những thằng pending mà quá 1 tiếng → expired logic
                    count = payments.Count(p =>
                        (p.Status == "expired") ||
                        (p.Status == "pending" && p.CreatedAt.AddHours(1) < now)
                    );
                }
                else if (s.code == "pending")
                {
                    // Đếm những pending vẫn còn trong hạn 1 tiếng
                    count = payments.Count(p =>
                        p.Status == "pending" && p.CreatedAt.AddHours(1) >= now
                    );
                }
                else
                {
                    // Các status khác giữ nguyên
                    count = payments.Count(p => p.Status == s.code);
                }

                var percentage = totalTransactions > 0
                    ? Math.Round(count * 100.0 / totalTransactions, 1)
                    : 0;

                return new
                {
                    status = s.label,
                    code = s.code,
                    count,
                    percentage
                };
            });

            return Ok(new
            {
                totalTransactions,
                totalRevenue,
                successRate,
                compareWithLastMonth = compare,
                byGateway = gatewayDict,
                byStatus
            });
        }
    }

}
