using Microsoft.EntityFrameworkCore;

namespace AIGenVideo.Server.Data;

public class ApplicationDbContext : IdentityDbContext<AppUser, AppRole, string>
{
    public DbSet<Entities.Payment> Payments { get; set; }
    public DbSet<UserVipSubscription> UserVipSubscriptions { get; set; }
    public DbSet<VipPlan> VipPlans { get; set; }
    public DbSet<Platform> Platforms { get; set; }
    public DbSet<UploadLog> UploadLogs { get; set; }
    public DbSet<UserSocialAccount> UserSocialAccounts { get; set; }
    public DbSet<VideoData> VideoData { get; set; } = default!;
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

        builder.Entity<Platform>()
            .HasIndex(p => p.Code)
            .IsUnique(); 
    }
}
