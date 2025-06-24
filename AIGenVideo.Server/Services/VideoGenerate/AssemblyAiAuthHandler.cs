using System.Net.Http;
using System.Net.Http.Headers;
using System.Threading;
using System.Threading.Tasks;

namespace AIGenVideo.Server.Services.VideoGenerate;

public class AssemblyAiAuthHandler : DelegatingHandler
{
    private readonly IConfiguration _configuration;

    public AssemblyAiAuthHandler(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    protected override async Task<HttpResponseMessage> SendAsync(HttpRequestMessage request, CancellationToken cancellationToken)
    {
        string apiKey = _configuration["ApiKeys:AssemblyAI"];
        if (string.IsNullOrEmpty(apiKey))
        {
            throw new InvalidOperationException("AssemblyAI API Key is not configured.");
        }

        // This is now the ONLY place the header is being added.
        // It's added to the specific request right before it's sent.
        request.Headers.Add("authorization", apiKey);

        return await base.SendAsync(request, cancellationToken);
    }
}