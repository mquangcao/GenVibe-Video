using AIGenVideo.Server.Models.Configurations;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.IdentityModel.Tokens;

namespace AIGenVideo.Server.Bootstraping;

public static class ApplicationServiceExtensions
{
    public static IHostApplicationBuilder AddApplicationServices(this IHostApplicationBuilder builder)
    {
        builder.Services.AddControllers();

        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        // Add application services here
        // Example: builder.Services.AddScoped<IMyService, MyService>();
        builder.Services.AddSingleton<IEmailSender, MailKitEmailSender>();
        builder.Services.AddScoped<ITokenService, JwtTokenService>();
        builder.Services.AddScoped<IAuthService, AuthService>();

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
            options.DefaultAuthenticateScheme =
            options.DefaultChallengeScheme =
            options.DefaultForbidScheme =
            options.DefaultScheme =
            options.DefaultSignInScheme =
            options.DefaultSignOutScheme = JwtBearerDefaults.AuthenticationScheme;

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

        return builder;
    }
}
