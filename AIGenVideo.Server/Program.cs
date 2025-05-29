var builder = WebApplication.CreateBuilder(args);

builder.AddApplicationServices();
builder.AddSwaggerUIService();
builder.AddIdentityServices();
builder.AddAuthenticationScheme();
builder.AddOptionPattern();

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

app.UseAuthorization();

app.MapControllers();

app.MapFallbackToFile("/index.html");

app.Run();
