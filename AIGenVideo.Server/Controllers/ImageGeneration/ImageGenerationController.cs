using AIGenVideo.Server.Models.RequestModels.ImageGenerate;
using AIGenVideo.Server.Services.ImageGenerate;

namespace AIGenVideo.Server.Controllers.ImageGeneration
{
    [ApiController]
    [Route("api/imagegeneration")]
    public class ImageGenerationController : ControllerBase
    {
        private readonly ImageGenerationService _imageGenerationService;
        private readonly ILogger<ImageGenerationController> _logger;

        public ImageGenerationController(ImageGenerationService imageGenerationService, ILogger<ImageGenerationController> logger)
        {
            _imageGenerationService = imageGenerationService;
            _logger = logger;
        }

        [HttpPost("generate")]
        public async Task<IActionResult> GenerateImage([FromBody] GenerateImageRequest request)
        {
            _logger.LogInformation("Generating image for prompt: {prompt}", request.Prompt);
            if (string.IsNullOrWhiteSpace(request.Prompt))
            {
                return BadRequest(new { message = "Prompt cannot be empty." });
            }

            try
            {
                var base64Image = await _imageGenerationService.GenerateImageAsync(request);
                return Ok(new { imageUrl = $"data:image/png;base64,{base64Image}" });
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error generating image for prompt: {prompt}", request.Prompt);
                return StatusCode(500, new { message = ex.Message });
            }
        }
    }
}