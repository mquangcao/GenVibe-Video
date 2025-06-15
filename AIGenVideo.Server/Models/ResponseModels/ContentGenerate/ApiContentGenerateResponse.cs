namespace AIGenVideo.Server.Models.ResponseModels.ContentGenerate;

public class ApiContentGenerateResponse<T>
{
    public bool Success { get; set; }
    public string Message { get; set; }
    public T Data { get; set; }
}