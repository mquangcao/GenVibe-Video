// AudioController.cs
using Microsoft.AspNetCore.Mvc;
using Microsoft.CognitiveServices.Speech;
using Microsoft.CognitiveServices.Speech.Audio;
using System.Threading.Tasks;

namespace AiGenVideo.Server.Controllers.ContentGeneration
{
    [ApiController]
    [Route("api/[controller]")]
    public class AudioController : ControllerBase
    {
        private readonly IConfiguration _configuration;

        public AudioController(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        [HttpPost("generate")]
        public async Task<IActionResult> GenerateAudio([FromBody] TextToSpeechRequest request)
        {
            try
            {
                var subscriptionKey = _configuration["AzureSpeech:Key"];
                var region = _configuration["AzureSpeech:Region"];

                var speechConfig = SpeechConfig.FromSubscription(subscriptionKey, region);
                speechConfig.SpeechSynthesisVoiceName = request.VoiceName;
                speechConfig.SetSpeechSynthesisOutputFormat(SpeechSynthesisOutputFormat.Audio16Khz32KBitRateMonoMp3);

                // Create temporary file path
                string tempFilePath = Path.GetTempFileName() + ".mp3";

                using var audioConfig = AudioConfig.FromWavFileOutput(tempFilePath);
                using var synthesizer = new SpeechSynthesizer(speechConfig, audioConfig);

                // Build SSML with rate control
                string ssml = $@"
                <speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='en-US'>
                    <voice name='{request.VoiceName}'>
                        <prosody rate='{request.SpeechRate:+0.##%}'>
                            {System.Security.SecurityElement.Escape(request.Text)}
                        </prosody>
                    </voice>
                </speak>";

                var result = await synthesizer.SpeakSsmlAsync(ssml);

                if (result.Reason == ResultReason.SynthesizingAudioCompleted)
                {
                    var fileBytes = await System.IO.File.ReadAllBytesAsync(tempFilePath);
                    System.IO.File.Delete(tempFilePath);

                    return File(fileBytes, "audio/mpeg", request.Filename);
                }

                return BadRequest("Speech synthesis failed");
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }
    }

    public class TextToSpeechRequest
    {
        public string Text { get; set; }
        public string VoiceName { get; set; }
        public double SpeechRate { get; set; }
        public string Filename { get; set; }
    }
}