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
    [FromQuery(Name = "gateway")]
    public string GateWay {  get; set; } = string.Empty;
    [FromQuery(Name = "status")]
    public string Status {  get; set; } = string.Empty;

    private DateTime? _fromDate;
    private DateTime? _toDate;

    public DateTime? FromDate
    {
        get => _fromDate.HasValue
            ? DateTime.SpecifyKind(_fromDate.Value, DateTimeKind.Utc)
            : (DateTime?)null;
        set => _fromDate = value.HasValue
            ? DateTime.SpecifyKind(value.Value, DateTimeKind.Utc)
            : (DateTime?)null;
    }

    public DateTime? ToDate
    {
        get => _toDate.HasValue
            ? DateTime.SpecifyKind(_toDate.Value, DateTimeKind.Utc)
            : (DateTime?)null;
        set => _toDate = value.HasValue
            ? DateTime.SpecifyKind(value.Value, DateTimeKind.Utc)
            : (DateTime?)null;
    }
}


public record PaginationRequest
{
    [FromQuery(Name = "limit")]
    public int PageSize { get; init; } = 10;

    [FromQuery(Name = "page")]
    public int PageIndex { get; init; } = 1;
}