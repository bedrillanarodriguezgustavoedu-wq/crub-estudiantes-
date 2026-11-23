using GalyCrudBackend.Services;
using Microsoft.Extensions.Configuration;
using Xunit;

namespace GalyCrudBackend.Tests;

public class AuthServiceTests
{
    private static AuthService CrearServicio()
    {
        var datos = new Dictionary<string, string?>
        {
            ["Jwt:Key"] = "clave-de-prueba-super-secreta-con-mas-de-32-caracteres",
            ["Jwt:Issuer"] = "GalyCrudTest",
            ["Jwt:Audience"] = "GalyCrudTestClient",
            ["Jwt:ExpireMinutes"] = "60",
            ["Auth:Users:0:Username"] = "admin",
            ["Auth:Users:0:Password"] = "Admin123!",
            ["Auth:Users:0:Role"] = "Admin",
            ["Auth:Users:1:Username"] = "consulta",
            ["Auth:Users:1:Password"] = "Consulta123!",
            ["Auth:Users:1:Role"] = "Viewer"
        };

        return new AuthService(new ConfigurationBuilder().AddInMemoryCollection(datos).Build());
    }

    [Fact]
    public async Task Login_CredencialesCorrectas_DevuelveTokenYRol()
    {
        var resultado = await CrearServicio().AutenticarAsync("admin", "Admin123!");

        Assert.NotNull(resultado);
        Assert.False(string.IsNullOrWhiteSpace(resultado.Token));
        Assert.Equal("Admin", resultado.Rol);
    }

    [Fact]
    public async Task Login_PasswordIncorrecto_DevuelveNull()
    {
        var resultado = await CrearServicio().AutenticarAsync("admin", "incorrecto");

        Assert.Null(resultado);
    }

    [Fact]
    public async Task Login_UsuarioInexistente_DevuelveNull()
    {
        var resultado = await CrearServicio().AutenticarAsync("nobody", "Admin123!");

        Assert.Null(resultado);
    }

    [Fact]
    public async Task Login_UsuarioConsulta_TieneRolViewer()
    {
        var resultado = await CrearServicio().AutenticarAsync("consulta", "Consulta123!");

        Assert.NotNull(resultado);
        Assert.Equal("Viewer", resultado.Rol);
    }
}
