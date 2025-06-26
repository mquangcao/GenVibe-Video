using AIGenVideo.Server.Models.DomainModels;

namespace AIGenVideo.Server.Abstractions;

public interface IOAuthStateService
{
    Task SetStateAsync(string state, OAuthStateData data);
    Task<OAuthStateData?> GetStateAsync(string state);
    Task RemoveStateAsync(string state);
}
