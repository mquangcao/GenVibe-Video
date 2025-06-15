namespace AIGenVideo.Server.Models.DomainModels;

public class VipPlanDomain
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public string Name { get; set; } = string.Empty;
    public string Description { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int DurationInMonths { get; set; }
}
