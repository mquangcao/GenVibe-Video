namespace AIGenVideo.Server.Models.RequestModels.Admin;

public class UserListRequest
{
    /// <summary>
    /// The number of items to return per page.
    /// </summary>
    public int PageSize { get; set; } = 10;
    /// <summary>
    /// The index of the page to return.
    /// </summary>
    public int PageIndex { get; set; } = 0;
    /// <summary>
    /// Optional search term to filter users by username or email.
    /// </summary>
    public string? SearchTerm { get; set; }
}
