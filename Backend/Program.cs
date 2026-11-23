using System.Text;
using GalyCrudBackend.Data;
using GalyCrudBackend.Middleware;
using GalyCrudBackend.Services;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Serilog;

var builder = WebApplication.CreateBuilder(args);

var directorioLogs = Path.Combine(builder.Environment.ContentRootPath, "logs");
Directory.CreateDirectory(directorioLogs);

builder.Host.UseSerilog((contexto, configuracion) => configuracion
    .ReadFrom.Configuration(contexto.Configuration)
    .Enrich.FromLogContext()
    .WriteTo.Console()
    .WriteTo.File(
        Path.Combine(contexto.HostingEnvironment.ContentRootPath, "logs", "galycrud-.log"),
        rollingInterval: RollingInterval.Day));

var cadenaConexion = builder.Configuration.GetConnectionString("DefaultConnection")
                     ?? "Data Source=Data/colegio.db";
var directorioDatos = Path.Combine(builder.Environment.ContentRootPath, "Data");
Directory.CreateDirectory(directorioDatos);

builder.Services.AddDbContext<AppDbContext>(opciones => opciones.UseSqlite(cadenaConexion));
builder.Services.AddScoped<IEstudianteService, EstudianteService>();
builder.Services.AddSingleton<IAuthService, AuthService>();

builder.Services.AddControllers();

var claveJwt = builder.Configuration["Jwt:Key"];
if (string.IsNullOrWhiteSpace(claveJwt) || Encoding.UTF8.GetByteCount(claveJwt) < 32)
{
    throw new InvalidOperationException("Jwt:Key debe configurarse y contener al menos 32 bytes.");
}

var emisorJwt = builder.Configuration["Jwt:Issuer"];
var audienciaJwt = builder.Configuration["Jwt:Audience"];
if (string.IsNullOrWhiteSpace(emisorJwt) || string.IsNullOrWhiteSpace(audienciaJwt))
{
    throw new InvalidOperationException("Deben configurarse Jwt:Issuer y Jwt:Audience.");
}

if (!builder.Configuration.GetSection("Auth:Users").GetChildren().Any())
{
    throw new InvalidOperationException("Debe configurarse al menos un usuario en Auth:Users.");
}

builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(opciones =>
    {
        opciones.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            ValidIssuer = emisorJwt,
            ValidAudience = audienciaJwt,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(claveJwt))
        };
    });

builder.Services.AddAuthorization();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(opciones =>
{
    opciones.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "Colegio Galy API",
        Version = "v1",
        Description = "API REST para la gestión de estudiantes del colegio."
    });

    opciones.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.ApiKey,
        Scheme = "Bearer",
        Description = "Escribe: Bearer {token}"
    });

    opciones.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
});

var origenes = builder.Configuration.GetSection("Cors:Origins").Get<string[]>()
               ?? new[] { "http://localhost:4200" };

builder.Services.AddCors(opciones =>
{
    opciones.AddPolicy("AngularDev", politica =>
    {
        politica.WithOrigins(origenes)
               .AllowAnyHeader()
               .AllowAnyMethod();
    });
});

var app = builder.Build();

app.Logger.LogInformation("API Colegio Galy iniciada en el entorno {Entorno}", app.Environment.EnvironmentName);

using (var ambito = app.Services.CreateScope())
{
    var contexto = ambito.ServiceProvider.GetRequiredService<AppDbContext>();
    contexto.Database.EnsureCreated();
}

app.UseMiddleware<ExceptionMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

var puertoHttps = builder.Configuration["ASPNETCORE_HTTPS_PORT"];
if (!app.Environment.IsDevelopment() && !string.IsNullOrWhiteSpace(puertoHttps))
{
    app.UseHttpsRedirection();
}

app.UseCors("AngularDev");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.MapGet("/health", () => Results.Ok(new
{
    status = "ok",
    timestamp = DateTime.UtcNow
}));

try
{
    app.Run();
}
finally
{
    Log.CloseAndFlush();
}
