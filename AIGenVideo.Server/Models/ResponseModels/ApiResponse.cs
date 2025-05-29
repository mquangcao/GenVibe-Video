using System.Text.Json.Serialization;

namespace AIGenVideo.Server.Models.ResponseModels;

public sealed class ApiResponse : ApiResponse<object>
{

}

public class ApiResponse<T>
{
    [JsonPropertyName("success")]
    public bool Success { get; init; }

    [JsonPropertyName("message")]
    public string? Message { get; init; }

    [JsonPropertyName("data")]
    public T? Data { get; init; }
    public static ApiResponse<T> SuccessResponse(T? data, string? message = null)
    {
        return new ApiResponse<T>
        {
            Success = true,
            Message = message,
            Data = data
        };
    }
    public static ApiResponse<T> FailResponse(string message)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Message = message
        };
    }
    public static ApiResponse<T> FailResponse(string message, T? data)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Message = message,
            Data = data
        };
    }
}
