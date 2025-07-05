namespace AIGenVideo.Server.Models.RequestModels;

public class UploadVideoRequest
{
    [FromForm(Name = "videoFile")]
    public IFormFile VideoFile { get; set; } = default!;

    [FromForm(Name = "title")]
    public string Title { get; set; } = default!;

    [FromForm(Name = "description")]
    public string Description { get; set; } = default!;

    [FromForm(Name = "tags")]
    public string Tags { get; set; } = default!;
}
