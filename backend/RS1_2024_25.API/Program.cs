using FluentValidation;
using Microsoft.EntityFrameworkCore;
using RS1_2024_25.API.Data;
using RS1_2024_25.API.Endpoints.AdvertisementEndpoints;
using RS1_2024_25.API.Endpoints.UserEndpoints;
using RS1_2024_25.API.Helper;
using RS1_2024_25.API.Helper.Auth;
using RS1_2024_25.API.Hubs;
using RS1_2024_25.API.Options;
using RS1_2024_25.API.Services;
using RS1_2024_25.API.Services.Interfaces;
using static RS1_2024_25.API.Endpoints.AdvertisementEndpoints.AdvertisementUpdateOrInsertEndpoint;
using static RS1_2024_25.API.Endpoints.UserEndpoints.UserUpdateOrInsertEndpoint;


var config = new ConfigurationBuilder()
.AddJsonFile("appsettings.json", false)
.Build();

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.

builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseSqlServer(config.GetConnectionString("db1")));

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(x => x.OperationFilter<MyAuthorizationSwaggerHeader>());
builder.Services.AddHttpContextAccessor();

//dodajte vaše servise
builder.Services.AddTransient<MyAuthService>();
builder.Services.AddTransient<MyTokenGenerator>();
builder.Services.Configure<ImageOptions>(
builder.Configuration.GetSection("ImageOptions"));
builder.Services.AddScoped<IImageValidator, ImageValidator>();
builder.Services.AddScoped<IImageProcessor, ImageProcessor>();
builder.Services.AddScoped<IImageStorage, LocalImageStorage>();
builder.Services.AddSignalR();

builder.Services.AddScoped<IValidator<AdvertUpdateOrInsertRequest>, AdvertisementUpdateOrInsertValidator>();
builder.Services.AddScoped<IValidator<UserUpdateOrInsertRequest>, UserUpdateOrInsertValidator>();

builder.Services.AddHostedService<UserStatusCleanupService>();

var app = builder.Build();

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI();

app.UseCors(
    options => options
        .SetIsOriginAllowed(x => _ = true)
        .AllowAnyMethod()
        .AllowAnyHeader()
        .AllowCredentials()
); //This needs to set everything allowed


app.UseAuthorization();
app.UseStaticFiles();

app.MapControllers();
app.MapHub<ChatHub>("/chathub");

app.Run();
