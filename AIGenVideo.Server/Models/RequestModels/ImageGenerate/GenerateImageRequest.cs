using System.ComponentModel.DataAnnotations;

namespace AIGenVideo.Server.Models.RequestModels.ImageGenerate
{
    public class GenerateImageRequest
    {
        [Required]
        public string Prompt { get; set; }
    }
}