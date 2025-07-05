namespace AIGenVideo.Server.Models.DomainModels;

public class PlatformInfo
{
    public string PlatformCode { get; set; } = string.Empty;
    public bool IsConnecting { get; set; } 
    public string ChannelName { set; get; } = string.Empty;
    public int SubscriberCount { set; get; } = 0;
    public int VideoCount { set; get; } = 0;
    public long ViewCount { set; get; } = 0;
    public string AvatarUrl { set; get; } = string.Empty;
    public string ChannelHandle { set; get; } = string.Empty;
    public DateTime ConnectedDate { set; get; } = DateTime.Now;
    public DateTime LastSync { set; get; } = DateTime.Now;
    public string ErrorMsg {  set; get; } = string.Empty;
}
