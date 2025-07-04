using AIGenVideo.Server.Abstractions.VideoGenerate;
using AIGenVideo.Server.Data.Migrations;
using Microsoft.AspNetCore.Mvc;

namespace AIGenVideo.Server.Controllers.VideoGeneration;

[ApiController]
[Route("api/saveVideo")]
public class ImagesController : ControllerBase
{
    private readonly ApplicationDbContext _context;
    private readonly ILogger<ImagesController> _logger;

    public ImagesController(ILogger<ImagesController> logger, ApplicationDbContext context)
    {
        _context = context;
        _logger = logger;
    }

    // In your ImagesController.cs or a new VideoDataController.cs

    [HttpPost("save-video-data")]
    public async Task<IActionResult> SaveFullVideoData([FromBody] VideoData requestData)
    {
        if (requestData == null)
        {
            return BadRequest("No data provided.");
        }

        // You can add validation here if needed

        // Set the ID and CreatedBy on the server for security
        requestData.Id = Guid.NewGuid().ToString();
        // requestData.CreatedBy = User.Identity.Name; // Example: Get user from claims

        _context.VideoData.Add(requestData);
        await _context.SaveChangesAsync();

        return Ok(new { success = true, message = "Full video data saved successfully", videoId = requestData.Id });
    }

}