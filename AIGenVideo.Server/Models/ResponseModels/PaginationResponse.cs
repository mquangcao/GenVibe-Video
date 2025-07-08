namespace AIGenVideo.Server.Models.ResponseModels;

public sealed record PaginationResponse<TEntity> where TEntity : class
{
    public int PageIndex { get; set; }
    public int PageSize { get; set; }
    public long Count { get; set; }
    public IEnumerable<TEntity> Items { set; get; } = default!;
}