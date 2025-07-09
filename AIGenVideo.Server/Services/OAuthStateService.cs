using AIGenVideo.Server.Models.DomainModels;
using Microsoft.Extensions.Caching.Distributed;
using System.Text.Json;

namespace AIGenVideo.Server.Services;

public class OAuthStateService : IOAuthStateService
{
    private readonly IDistributedCache _cache;

    public OAuthStateService(IDistributedCache cache)
    {
        _cache = cache;
    }

    public async Task SetStateAsync(string state, OAuthStateData data)
    {
        var json = JsonSerializer.Serialize(data);
        await _cache.SetStringAsync($"oauth_state:{state}", json, new DistributedCacheEntryOptions
        {
            AbsoluteExpirationRelativeToNow = TimeSpan.FromMinutes(5)
        });
    }

    public async Task<OAuthStateData?> GetStateAsync(string state)
    {
        var json = await _cache.GetStringAsync($"oauth_state:{state}");
        return json is null ? default : JsonSerializer.Deserialize<OAuthStateData>(json);
    }

    public async Task RemoveStateAsync(string state)
    {
        await _cache.RemoveAsync($"oauth_state:{state}");
    }
}
