// AIGenVideo.Server/Controllers/TextToSpeechController.cs
using Google.Cloud.TextToSpeech.V1;
using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Threading.Tasks;

namespace AIGenVideo.Server.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class TextToSpeechController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<TextToSpeechController> _logger;

        public TextToSpeechController(IConfiguration configuration, ILogger<TextToSpeechController> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        [HttpPost("synthesize")]
        public async Task<IActionResult> SynthesizeSpeech([FromBody] SpeechRequest request)
        {
            try
            {
                _logger.LogInformation("Synthesizing speech for text: {TextPreview}",
                    request.Text.Length > 50 ? request.Text.Substring(0, 50) + "..." : request.Text);

                // Set environment variable for Google Cloud credentials
                // Note: In production, use a more secure approach
                var credentialsPath = _configuration["GoogleCloud:CredentialsPath"];
                Environment.SetEnvironmentVariable("GOOGLE_APPLICATION_CREDENTIALS", credentialsPath);

                // Create client
                var client = TextToSpeechClient.Create();

                // Build the synthesis input
                var input = new SynthesisInput
                {
                    Text = request.Text
                };

                // Build the voice request
                var voice = new VoiceSelectionParams
                {
                    LanguageCode = request.LanguageCode ?? "en-US",
                    Name = request.VoiceName ?? "en-US-Standard-B"
                };

                // Build the audio config
                var audioConfig = new AudioConfig
                {
                    AudioEncoding = AudioEncoding.Mp3,
                    SpeakingRate = request.SpeechRate
                };

                // Perform the text-to-speech request
                var response = await client.SynthesizeSpeechAsync(input, voice, audioConfig);

                // Return the audio content as a file
                return File(response.AudioContent.ToByteArray(), "audio/mpeg", $"{Guid.NewGuid()}.mp3");
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error synthesizing speech");
                return StatusCode(500, new { error = "Speech synthesis failed", message = ex.Message });
            }
        }
    }

    public class SpeechRequest
    {
        public string Text { get; set; }
        public string VoiceName { get; set; }
        public string LanguageCode { get; set; }
        public float SpeechRate { get; set; } = 1.0f;
    }
}