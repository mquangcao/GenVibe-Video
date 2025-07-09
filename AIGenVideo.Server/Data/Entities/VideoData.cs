using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

[Table("VideoData")]
public class VideoData
{
    [Key]
    [Column("id")]
    public string Id { get; set; } = Guid.NewGuid().ToString();

    [Required]
    [Column("audioFileUrl")]
    [MaxLength(255)]
    public string AudioFileUrl { get; set; } = default!;

    [Required]
    [Column("captions", TypeName = "nvarchar(max)")] // sửa lại
    public string? Captions { get; set; } = default!;

    [Required]
    [Column("videoUrl", TypeName = "nvarchar(max)")] // sửa lại
    public string VideoUrl { get; set; } = default!;

    [Column("imageListUrl")]
    public List<string> ImageListUrl { get; set; } = new List<string>();

    [Required]
    [Column("srts", TypeName = "nvarchar(max)")]
    public string? Srts { get; set; } = default!;
    [Required]
    [Column("createdBy")]
    [MaxLength(255)]
    public string CreatedBy { get; set; } = default!;
}
