namespace AIGenVideo.Server.Abstractions;

public interface ITokenService
{
    string CreateToken(AppUser user, string role);
}
