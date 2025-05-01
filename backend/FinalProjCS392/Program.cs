using FinalProjCS392.Models;
using FinalProjCS392.Services;
using MongoDB.Driver;

var builder = WebApplication.CreateBuilder(args);
// Add to Program.cs
var configuration = builder.Configuration;

// access the keys
string googleApiKey = configuration["GOOGLE_API_KEY"];
string unwrangleApiKey = configuration["UNWRANGLE_API_KEY"];
builder.Services.AddScoped<CartService>();
builder.Services.AddSingleton<ImageService>();
builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<UserService>();
// Register all scraper services
builder.Services.AddScoped<WalmartScraperService>();
builder.Services.AddScoped<CostcoScraperService>();
builder.Services.AddScoped<SamsClubScraperService>();
builder.Services.AddScoped<UnwrangleTargetDemo.TargetWebScraperService>();

builder.Services.Configure<MongoDbSettings>(builder.Configuration.GetSection("MongoDb"));
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));


// Add services to the container.
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAllOrigins", policy =>
    {
        policy.AllowAnyOrigin()          //allows any origin to access the API (Not optimal but this is development)
              .AllowAnyMethod()          //allows any HTTP method (GET, POST, etc.)
              .AllowAnyHeader();         //allows any headers
    });
});
builder.Services.AddControllers();
builder.Services.AddHttpClient(); //register HttpClient
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();



var app = builder.Build();

//apply the CORS policy globally
app.UseCors("AllowAllOrigins");

//app.UseHttpsRedirection();
app.UseRouting();

//// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle

////configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
    app.UseDeveloperExceptionPage();
}

app.UseAuthorization();

app.MapControllers();
app.Run();