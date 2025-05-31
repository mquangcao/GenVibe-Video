using AIGenVideo.Server.Models.Configurations;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;


namespace AIGenVideo.Server.Services;

public class JwtTokenService : ITokenService
{
    private readonly IConfiguration _config;
    private readonly SymmetricSecurityKey _key;
    private readonly JwtOptions _options;
    public JwtTokenService(IConfiguration config, IOptions<JwtOptions> options)
    {
        _config = config;
        _options = options.Value;
        _key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_options.SigningKey ?? throw new InvalidOperationException("Config jwt??")));
    }
    public string CreateToken(AppUser user)
    {
        var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Email, user.Email ?? ""),
                new Claim(JwtRegisteredClaimNames.GivenName, user.UserName ?? "")
            };
        var creds = new SigningCredentials(_key, SecurityAlgorithms.HmacSha512Signature);
        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = DateTime.Now.AddMinutes(_options.AccessTokenExpirationInMinutes),
            SigningCredentials = creds,
            Issuer = _options.Issuer,
            Audience = _options.Audience
        };

        var tokenHandler = new JwtSecurityTokenHandler();

        var token = tokenHandler.CreateToken(tokenDescriptor);

        return tokenHandler.WriteToken(token);

    }

}

