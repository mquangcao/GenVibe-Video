using Microsoft.EntityFrameworkCore.Storage;
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

    [JsonIgnore]
    public int StatusCode { get; set; } = 200;
    public static ApiResponse<T> SuccessResponse(T? data, string? message = null, int statusCode = 200)
    {
        return new ApiResponse<T>
        {
            Success = true,
            Message = message,
            Data = data,
            StatusCode = statusCode
        };
    }
    public static ApiResponse<T> FailResponse(string message, int statusCode = 400)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Message = message,
            Data = default,
            StatusCode = statusCode
        };
    }
    public static ApiResponse<T> FailResponse(string message, T? data, int statusCode = 400)
    {
        return new ApiResponse<T>
        {
            Success = false,
            Message = message,
            Data = data,
            StatusCode = statusCode
        };
    }
}
