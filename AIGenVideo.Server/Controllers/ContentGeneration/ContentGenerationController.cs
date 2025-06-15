using AIGenVideo.Server.Abstractions.ContentGenerate;
using AIGenVideo.Server.Models.RequestModels.ContentGenerate;
using AIGenVideo.Server.Models.ResponseModels.ContentGenerate;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;

namespace AIGenVideo.Server.Controllers.ContentGeneration;

[ApiController]
[Route("api/content")]
[Produces("application/json")]
public class ContentGenerationController : ControllerBase
{
    private readonly IMainContentGenerationService _contentService;
    private readonly ILogger<ContentGenerationController> _logger;

    public ContentGenerationController(IMainContentGenerationService contentService, ILogger<ContentGenerationController> logger)
    {
        _contentService = contentService;
        _logger = logger;
    }

    [HttpPost("generate")]
    [ProducesResponseType(typeof(ApiContentGenerateResponse<List<SuggestionModel>>), StatusCodes.Status200OK)]
    [ProducesResponseType(typeof(ApiContentGenerateResponse<object>), StatusCodes.Status400BadRequest)]
    [ProducesResponseType(typeof(ApiContentGenerateResponse<object>), StatusCodes.Status500InternalServerError)]
    public async Task<IActionResult> Generate([FromBody] GenerateContentRequest request)
    {
        try
        {
            if (request == null)
            {
                _logger.LogWarning("Received null request");
                return BadRequest(new ApiContentGenerateResponse<object> 
                { 
                    Success = false, 
                    Message = "Request body cannot be null" 
                });
            }

            if (string.IsNullOrEmpty(request.Topic))
            {
                _logger.LogWarning("Received empty topic");
                return BadRequest(new ApiContentGenerateResponse<object> 
                { 
                    Success = false, 
                    Message = "Topic is required" 
                });
            }

            if (string.IsNullOrEmpty(request.Context))
            {
                _logger.LogWarning("Received empty context");
                return BadRequest(new ApiContentGenerateResponse<object> 
                { 
                    Success = false, 
                    Message = "Context is required" 
                });
            }

            _logger.LogInformation("Generating content for topic: {Topic} with context: {Context}", request.Topic, request.Context);
            var suggestions = await _contentService.GenerateContentAsync(request);
            
            var response = new ApiContentGenerateResponse<List<SuggestionModel>>
            {
                Success = true,
                Data = suggestions,
                Message = "Content generated successfully."
            };
            
            _logger.LogInformation("Successfully generated content with {Count} suggestions", suggestions.Count);
            return Ok(response);
        }
        catch (NotSupportedException ex)
        {
            _logger.LogWarning(ex, "Unsupported context requested: {Context}", request.Context);
            return BadRequest(new ApiContentGenerateResponse<object> 
            { 
                Success = false, 
                Message = ex.Message 
            });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating content for topic: {Topic} with context: {Context}", request.Topic, request.Context);
            return StatusCode(500, new ApiContentGenerateResponse<object> 
            { 
                Success = false, 
                Message = $"An unexpected server error occurred: {ex.Message}" 
            });
        }
    }
}