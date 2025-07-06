using Microsoft.AspNetCore.Http;
using System.ComponentModel.DataAnnotations;

namespace AIGenVideo.Server.Models.RequestModels.VideoGeneration
{
    public class SaveVideoRequest
    {
        [Required] public IFormFile VideoFile { get; set; }
        [Required] public string Srts { get; set; }
        [Required] public string ImageListUrl { get; set; }
        [Required] public string AudioFileUrl { get; set; }
        [Required] public string Captions { get; set; }
    }
}