using System.ComponentModel.DataAnnotations;

namespace AIGenVideo.Server.Models.RequestModels.ContentGenerate;

public class GenerateContentRequest
{
    [Required(ErrorMessage = "Topic is required.")]
    public string Topic { get; set; }

    [Required(ErrorMessage = "Context is required.")]
    public string Context { get; set; }
}