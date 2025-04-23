using FinalProjCS392.Models;
using FinalProjCS392.Services;
using MongoDB.Driver;

var builder = WebApplication.CreateBuilder(args);
// Add to Program.cs
//var mongoConnectionString = "mongodb+srv://ashtoshbhandari2004ash:JQZsYx73EGO9NcDq@cluster0.w8r8ldq.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";
//var mongoClient = new MongoClient(mongoConnectionString);
//var mongoDatabase = mongoClient.GetDatabase("AuthUser");


//builder.Services.AddSingleton<IMongoDatabase>(mongoDatabase);
builder.Services.AddSingleton<ImageService>();

builder.Services.AddScoped<CartService>();
builder.Services.AddScoped<EmailService>();
builder.Services.AddScoped<UserService>();

// Bind and register MongoDbSettings using IOptions pattern, same with Email Settings
builder.Services.Configure<MongoDbSettings>(builder.Configuration.GetSection("MongoDb"));
builder.Services.Configure<EmailSettings>(builder.Configuration.GetSection("EmailSettings"));

// Register all scraper services
builder.Services.AddScoped<WalmartScraperService>();
builder.Services.AddScoped<CostcoScraperService>();
builder.Services.AddScoped<SamsClubScraperService>();
builder.Services.AddScoped<UnwrangleTargetDemo.TargetWebScraperService>();

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