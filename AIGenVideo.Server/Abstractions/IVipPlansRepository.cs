using AIGenVideo.Server.Models.DomainModels;

namespace AIGenVideo.Server.Abstractions;

public interface IVipPlansRepository
{
    Task<VipPlanDomain?> GetPlanByDurationAsync(int duration);
}
