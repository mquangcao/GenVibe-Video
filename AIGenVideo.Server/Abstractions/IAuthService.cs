namespace AIGenVideo.Server.Abstractions;

public interface IAuthService
{
    Task<ApiResponse<LoginResponse>> LoginAsync(LoginRequest request);
}
