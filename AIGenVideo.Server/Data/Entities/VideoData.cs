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
    [Column("script", TypeName = "nvarchar(max)")] // sửa lại
    public string Script { get; set; } = default!;

    [Required]
    [Column("audioFileUrl")]
    [MaxLength(255)]
    public string AudioFileUrl { get; set; } = default!;

    [Required]
    [Column("captions", TypeName = "nvarchar(max)")] // sửa lại
    public string Captions { get; set; } = default!;    

    [Column("imageList")]
    public List<string> ImageList { get; set; } = new List<string>();

    [Required]
    [Column("createdBy")]   
    [MaxLength(255)]
    public string CreatedBy { get; set; } = default!;
}
