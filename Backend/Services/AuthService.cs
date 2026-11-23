using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using GalyCrudBackend.Models;
using Microsoft.IdentityModel.Tokens;

namespace GalyCrudBackend.Services;

public class AuthService : IAuthService
{
    private readonly IConfiguration _configuration;
    private readonly Dictionary<string, (string Hash, string Rol)> _usuarios;

    public AuthService(IConfiguration configuration)
    {
        _configuration = configuration;
        _usuarios = new Dictionary<string, (string, string)>(StringComparer.OrdinalIgnoreCase);

        foreach (var usuario in configuration.GetSection("Auth:Users").GetChildren())
        {
            var nombre = usuario["Username"];
            var password = usuario["Password"];
            var rol = usuario["Role"];

            if (!string.IsNullOrWhiteSpace(nombre) && !string.IsNullOrWhiteSpace(password))
            {
                _usuarios[nombre] = (HashPassword(password), rol ?? "Viewer");
            }
        }
    }

    public Task<LoginResponse?> AutenticarAsync(string usuario, string password)
    {
        if (string.IsNullOrWhiteSpace(usuario) ||
            !_usuarios.TryGetValue(usuario.Trim(), out var datos) ||
            !VerifyPassword(password, datos.Hash))
        {
            return Task.FromResult<LoginResponse?>(null);
        }

        var clave = _configuration["Jwt:Key"] ?? throw new InvalidOperationException("Falta la configuración Jwt:Key.");
        var llave = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(clave));
        var credenciales = new SigningCredentials(llave, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, usuario.Trim()),
            new Claim(ClaimTypes.Name, usuario.Trim()),
            new Claim(ClaimTypes.Role, datos.Rol)
        };

        var minutos = int.TryParse(_configuration["Jwt:ExpireMinutes"], out var m) ? m : 60;
        var expira = DateTime.UtcNow.AddMinutes(minutos);

        var token = new JwtSecurityToken(
            issuer: _configuration["Jwt:Issuer"],
            audience: _configuration["Jwt:Audience"],
            claims: claims,
            notBefore: DateTime.UtcNow,
            expires: expira,
            signingCredentials: credenciales);

        return Task.FromResult<LoginResponse?>(new LoginResponse
        {
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            Usuario = usuario.Trim(),
            Rol = datos.Rol,
            Expira = expira
        });
    }

    private static string HashPassword(string password)
    {
        var salt = RandomNumberGenerator.GetBytes(16);
        var hash = Rfc2898DeriveBytes.Pbkdf2(password, salt, 100_000, HashAlgorithmName.SHA256, 32);
        return $"{Convert.ToBase64String(salt)}:{Convert.ToBase64String(hash)}";
    }

    private static bool VerifyPassword(string password, string almacenado)
    {
        var partes = almacenado.Split(':');
        if (partes.Length != 2)
        {
            return false;
        }

        var salt = Convert.FromBase64String(partes[0]);
        var esperado = Convert.FromBase64String(partes[1]);
        var actual = Rfc2898DeriveBytes.Pbkdf2(password, salt, 100_000, HashAlgorithmName.SHA256, esperado.Length);

        return CryptographicOperations.FixedTimeEquals(actual, esperado);
    }
}
