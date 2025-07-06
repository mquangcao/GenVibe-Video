using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.Identity.Web;
using AIGenVideo.Server.Bootstraping.ContentGenerate;
using AIGenVideo.Server.Bootstraping.VideoGenerate;
using AIGenVideo.Server.Bootstraping.ImageGenerate;
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddMicrosoftIdentityWebApi(builder.Configuration.GetSection("AzureAd"));

builder.AddApplicationServices();
builder.AddSwaggerUIService();
builder.AddIdentityServices();
//builder.AddAuthenticationScheme();    
builder.AddOptionPattern();
builder.Services.AddContentGenerateServices(builder.Configuration);
builder.Services.AddVideoGenerateServices(builder.Configuration);
builder.Services.AddImageGenerationServices();
builder.Services.AddScoped<CloudinaryService>();
var app = builder.Build();



app.UseDefaultFiles();
app.UseStaticFiles();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{

    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseRequestLogging();

app.UseAuthentication();

app.UseAuthorization();
app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();

