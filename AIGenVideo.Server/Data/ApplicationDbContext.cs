namespace AIGenVideo.Server.Data;

public class ApplicationDbContext : IdentityDbContext<AppUser, AppRole, string>
{
    public DbSet<Entities.Payment> Payments { get; set; }
    public DbSet<UserVipSubscription> UserVipSubscriptions { get; set; }
    public DbSet<VipPlan> VipPlans { get; set; }
    
    public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options) : base(options)
    {
    }

    protected override void OnModelCreating(ModelBuilder builder)
    {
        base.OnModelCreating(builder);
        foreach (var entityType in builder.Model.GetEntityTypes())
        {
            var tableName = entityType.GetTableName();
            if (tableName!.StartsWith("AspNet"))
            {
                entityType.SetTableName(tableName.Substring(6));
            }
        }
    }
}
