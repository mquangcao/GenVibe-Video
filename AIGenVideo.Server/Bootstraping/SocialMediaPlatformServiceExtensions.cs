using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.OAuth;
using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text.Json;

namespace AIGenVideo.Server.Bootstraping
{
    public static class SocialMediaPlatformServiceExtensions
    {
        public static IHostApplicationBuilder AddSocialPlatformServices(this IHostApplicationBuilder builder)
        {
            builder.Services.AddAuthentication()
                .AddOAuth("GoogleYouTube", options =>
                {
                    options.ClientId = builder.Configuration["Authentication:Google:ClientId"] ?? throw new ArgumentNullException("ClientId");
                    options.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"] ?? throw new ArgumentNullException("ClientSecret");
                    options.CallbackPath = "/youtube-callback";
                    options.AuthorizationEndpoint = "https://accounts.google.com/o/oauth2/v2/auth";
                    options.TokenEndpoint = "https://oauth2.googleapis.com/token";
                    options.UserInformationEndpoint = "https://www.googleapis.com/oauth2/v2/userinfo";

                    options.Scope.Add("openid");
                    options.Scope.Add("profile");
                    options.Scope.Add("email");
                    options.Scope.Add("https://www.googleapis.com/auth/youtube.readonly");
                    options.SaveTokens = true;

                    options.ClaimActions.MapJsonKey(ClaimTypes.NameIdentifier, "id");
                    options.ClaimActions.MapJsonKey(ClaimTypes.Name, "name");
                    options.ClaimActions.MapJsonKey(ClaimTypes.Email, "email");


                    options.Events = new OAuthEvents
                    {
                        OnCreatingTicket = async context =>
                        {
                            var request = new HttpRequestMessage(HttpMethod.Get, context.Options.UserInformationEndpoint);
                            request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", context.AccessToken);

                            var response = await context.Backchannel.SendAsync(request);
                            var jsonString = await response.Content.ReadAsStringAsync();

                            using var document = JsonDocument.Parse(jsonString);
                            context.RunClaimActions(document.RootElement);
                        },
                        OnRedirectToAuthorizationEndpoint = context =>
                        {
                            var uri = context.RedirectUri;

                            var separator = uri.Contains("?") ? "&" : "?";
                            uri += separator + "access_type=offline&prompt=consent";

                            context.Response.Redirect(uri);
                            return Task.CompletedTask;
                        }
                    };
                });
            return builder;
        }
    }
}
