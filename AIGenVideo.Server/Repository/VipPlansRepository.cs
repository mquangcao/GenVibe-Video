using AIGenVideo.Server.Models.DomainModels;

namespace AIGenVideo.Server.Repository;

public class VipPlansRepository : IVipPlansRepository
{
    private readonly ApplicationDbContext _context;

    public VipPlansRepository(ApplicationDbContext context)
    {
        _context = context;
    }

    public async Task<VipPlanDomain?> GetPlanByDurationAsync(int duration)
    {
        try
        {
            var plan = await _context.VipPlans.Where(v => v.DurationInMonths == duration).FirstOrDefaultAsync();
            if (plan == null)
            {
                return null;
            }

            return new VipPlanDomain
            {
                Id = plan.Id,
                Name = plan.Name,
                Description = plan.Description,
                //Price = plan.Price,
                DurationInMonths = plan.DurationInMonths
            };
        }
        catch (Exception)
        {
            throw;
        }
    }
}
