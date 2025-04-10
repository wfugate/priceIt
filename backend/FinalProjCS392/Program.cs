

using FinalProjCS392.Services;
using MongoDB.Driver;

var builder = WebApplication.CreateBuilder(args);
// Add to Program.cs
var mongoConnectionString = "mongodb+srv://williamfugate:rQNXj0wUb0GuzJwh@user-info.111hyzz.mongodb.net/?retryWrites=true&w=majority&appName=user-info";
var mongoClient = new MongoClient(mongoConnectionString);
var mongoDatabase = mongoClient.GetDatabase("priceItDB");

builder.Services.AddSingleton<IMongoDatabase>(mongoDatabase);
builder.Services.AddScoped<CartService>();
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
builder.Services.AddScoped<WalmartScraperService>(); // register service
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