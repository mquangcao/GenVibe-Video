namespace AIGenVideo.Server.Models.RequestModels;

public sealed record FilterParams : PaginationRequest
{
    [FromQuery(Name = "search")]
    public string SearchTerm { get; set; } = string.Empty;
    [FromQuery(Name = "sort")]
    public string SortBy { get; set; } = string.Empty;
    [FromQuery(Name = "order")]
    public string SortDirection { get; set; } = "asc";
    [FromQuery(Name = "id")]
    public string Id { get; set; } = string.Empty;

    [FromQuery(Name = "email")]
    public string Email { get; set; } = string.Empty;

    [FromQuery(Name = "role")]
    public string Role { get; set; } = string.Empty;

    [FromQuery(Name = "lockoutEnabled")]
    public string LockoutEnable { get; set; } = string.Empty;
}


public record PaginationRequest
{
    [FromQuery(Name = "limit")]
    public int PageSize { get; init; } = 10;

    [FromQuery(Name = "page")]
    public int PageIndex { get; init; } = 1;
}