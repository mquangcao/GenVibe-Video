namespace AIGenVideo.Server.Models.DomainModels;

public class OAuthStateData
{
    public string UserId { get; set; } = default!;
    public string CodeVerifier { get; set; } = default!;
}
