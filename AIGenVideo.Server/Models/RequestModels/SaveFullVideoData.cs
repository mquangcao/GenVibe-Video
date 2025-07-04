namespace AIGenVideo.Server.Models.RequestModels;
public class SaveFullVideoData
{
    public List<string> Images { get; set; }
    public string Captions { get; set; }
    public string Srts { get; set; }
    public string VideoUrl { get; set; }

}
