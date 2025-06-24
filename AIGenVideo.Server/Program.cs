using AIGenVideo.Server.Bootstraping.ContentGenerate;  

var builder = WebApplication.CreateBuilder(args);

builder.AddApplicationServices();
builder.AddSwaggerUIService();
builder.AddIdentityServices();
builder.AddAuthenticationScheme();
builder.Services.AddContentGenerateServices(builder.Configuration);
builder.AddOptionPattern();
builder.AddCors();
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
app.UseCors("AllowAll");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();

