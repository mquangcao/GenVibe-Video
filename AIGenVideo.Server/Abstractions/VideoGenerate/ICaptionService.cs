namespace AIGenVideo.Server.Abstractions.VideoGenerate;

public interface ICaptionService
{
    // Đổi kiểu trả về từ string (JSON) sang string (TranscriptId)
    Task<string> GenerateCaptionsAsync(string audioUrl);

    // Thêm phương thức mới để lấy phụ đề định dạng SRT/VTT
    Task<string> GetSubtitlesAsync(string transcriptId, string format = "srt");
}