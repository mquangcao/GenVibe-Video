namespace AIGenVideo.Server.Abstractions;

public interface IAuthService
{
    Task<ApiResponse<LoginResponse>> LoginAsync(LoginRequest request);
    Task<ApiResponse<RefreshTokenResponse>> RefreshTokenAsync(RefreshTokenRequest request);
    Task<ApiResponse<object>> RegisterAsync(RegisterRequest request, string role = Constants.USER_ROLE);
    Task<ApiResponse<object>> LogoutAsync(string username);
}
