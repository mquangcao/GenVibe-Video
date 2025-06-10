namespace AIGenVideo.Server.Models.RequestModels;

public sealed record FilterParams : PaginationRequest
{
    [FromQuery(Name = "search")]
    public string SearchTerm { get; set; } = string.Empty;
    [FromQuery(Name = "sort")]
    public string SortBy { get; set; } = string.Empty;
    [FromQuery(Name = "order")]
    public string SortDirection { get; set; } = "asc";
}


public record PaginationRequest
{
    [FromQuery(Name = "limit")]
    public int PageSize { get; init; } = 10;

    [FromQuery(Name = "page")]
    public int PageIndex { get; init; } = 1;
}