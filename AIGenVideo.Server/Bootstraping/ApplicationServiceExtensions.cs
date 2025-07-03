using AIGenVideo.Server.Models.Configurations;
using AIGenVideo.Server.Repository;
using AIGenVideo.Server.Services.SocialPlatform;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.IdentityModel.Tokens;
using Payment.Abstractions;
using Payment.Gateway;
using Payment.Gateway.Momo;
using Payment.Gateway.Momo.Config;
using Payment.Gateway.VnPay;
using Payment.Gateway.VnPay.Config;

namespace AIGenVideo.Server.Bootstraping;

public static class ApplicationServiceExtensions
{
    public static IHostApplicationBuilder AddApplicationServices(this IHostApplicationBuilder builder)
    {
        builder.Services.AddControllers();

        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();
        builder.Services.AddHttpClient();

        // Add application services here
        builder.Services.AddSingleton<IEmailSender, MailKitEmailSender>();
        builder.Services.AddScoped<ITokenService, JwtTokenService>();
        builder.Services.AddScoped<IAuthService, AuthService>();
        builder.Services.AddScoped<IRoleRepository, RoleRepository>();
        builder.Services.AddScoped<ICurrentUserService, CurrentUserService>();
        builder.Services.AddScoped<IVipPlansRepository, VipPlansRepository>();
        builder.Services.AddScoped<IPaymentService, PaymentService>();
        builder.Services.AddScoped<IUserVipService, UserVipService>();
        builder.Services.AddScoped<IUserVipSubscriptionRepository, UserVipSubscriptionRepository>();

        builder.Services.AddScoped<ISocialPlatformService, SocialPlatformService>();

        // payment
        builder.Services.AddScoped<VnPayPaymentGateway>();
        builder.Services.AddScoped<MomoPaymentGateway>();
        builder.Services.AddScoped<IPaymentGatewayFactory, PaymentGatewayFactory>();

        //redis
        builder.Services.AddStackExchangeRedisCache(options =>
        {
            options.Configuration = builder.Configuration.GetConnectionString("Redis");
            options.InstanceName = "AIGenVideo:";
        });

        builder.Services.AddScoped<IOAuthStateService, OAuthStateService>();

        builder.Services.AddScoped<IPlatformService , YouTubePlatformService>();


        return builder;
    }

    public static IHostApplicationBuilder AddSwaggerUIService(this IHostApplicationBuilder builder)
    {
        builder.Services.AddSwaggerGen(options =>
        {
            options.SwaggerDoc("v1", new OpenApiInfo
            {
                Title = "My API",
                Version = "v1"
            });

            options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
            {
                Name = "Authorization",
                Type = SecuritySchemeType.ApiKey,
                Scheme = "Bearer",
                BearerFormat = "JWT",
                In = ParameterLocation.Header,
                Description = "Nhập JWT token vào đây. Ví dụ: Bearer <token>"
            });

            options.AddSecurityRequirement(new OpenApiSecurityRequirement
            {
                {
                    new OpenApiSecurityScheme
                    {
                        Reference = new OpenApiReference
                        {
                            Type = ReferenceType.SecurityScheme,
                            Id = "Bearer"
                        },
                        In = ParameterLocation.Header
                    },
                    Array.Empty<string>()
                }
            });
        });
        return builder;
    }

    public static IHostApplicationBuilder AddIdentityServices(this IHostApplicationBuilder builder)
    {
        // Entity Framework Core configuration
        var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") ?? throw new InvalidOperationException("Connection string 'DefaultConnection' not found.");
        builder.Services.AddDbContext<ApplicationDbContext>(options =>
            options.UseSqlServer(connectionString));

        builder.Services.AddIdentity<AppUser, AppRole>()
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddDefaultTokenProviders();

        // password reset token life time
        builder.Services.Configure<DataProtectionTokenProviderOptions>(opt =>
        {
            opt.TokenLifespan = TimeSpan.FromMinutes(builder.Configuration.GetValue<int>("PasswordToken:LifeTimeInMinutes", 5)); 
        });

        return builder;
    }

    public static IHostApplicationBuilder AddAuthenticationScheme(this IHostApplicationBuilder builder)
    {
        builder.Services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultForbidScheme = JwtBearerDefaults.AuthenticationScheme;
            //options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
            //options.DefaultSignInScheme = JwtBearerDefaults.AuthenticationScheme;
            //options.DefaultSignOutScheme = JwtBearerDefaults.AuthenticationScheme;

        }).AddJwtBearer(options =>
        {
            var jwtOptions = builder.Configuration.GetSection("JWT").Get<JwtOptions>() ?? throw new InvalidOperationException("JWT configuration not found.");
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = jwtOptions.ValidateIssuer,
                ValidIssuer = jwtOptions.Issuer,
                ValidateAudience = jwtOptions.ValidateAudience,
                ValidAudience = jwtOptions.Audience,
                ValidateIssuerSigningKey = jwtOptions.ValidateIssuerSigningKey,
                IssuerSigningKey = new SymmetricSecurityKey(
                    System.Text.Encoding.UTF8.GetBytes(jwtOptions.SigningKey)
                ),
                ValidateLifetime = jwtOptions.ValidateLifetime,
                ClockSkew = TimeSpan.Zero
            };
        });
        return builder;
    }

    public static IHostApplicationBuilder AddOptionPattern(this IHostApplicationBuilder builder)
    {
        builder.Services.Configure<JwtOptions>(builder.Configuration.GetRequiredSection("JWT"));
        builder.Services.Configure<EmailOptions>(builder.Configuration.GetSection("EmailSettings"));
        builder.Services.Configure<LoginGoogleOptions>(builder.Configuration.GetSection("Authentication:Google"));
        builder.Services.Configure<MomoConfig>(builder.Configuration.GetSection("Payment:Momo"));
        builder.Services.Configure<VnpayConfig>(builder.Configuration.GetSection("Payment:VnPay"));
        builder.Services.Configure<TikTokOptions>(builder.Configuration.GetSection("Authentication:TikTok"));
        builder.Services.Configure<FacebookOptions>(builder.Configuration.GetSection("Authentication:Facebook"));

        return builder;
    }

    public static IHostApplicationBuilder AddCors(this IHostApplicationBuilder builder)
    {
        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowAll", policy =>
            {
                policy
                    .WithOrigins("https://localhost:50464")      
                    .AllowAnyMethod()
                    .AllowAnyHeader()
                    .AllowCredentials();     // nếu có dùng cookie / auth
            });
        });
        return builder;
    }
}
