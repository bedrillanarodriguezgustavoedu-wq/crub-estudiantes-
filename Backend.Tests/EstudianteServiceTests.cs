using GalyCrudBackend.Data;
using GalyCrudBackend.DTOs;
using GalyCrudBackend.Exceptions;
using GalyCrudBackend.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace GalyCrudBackend.Tests;

public class EstudianteServiceTests
{
    private static AppDbContext CrearContexto()
    {
        var opciones = new DbContextOptionsBuilder<AppDbContext>()
            .UseInMemoryDatabase($"galycrud-{Guid.NewGuid()}")
            .Options;

        var contexto = new AppDbContext(opciones);
        contexto.Database.EnsureCreated();
        return contexto;
    }

    private static EstudianteCreateDto NuevoDto(string correo = "nuevo@colegio.edu") => new()
    {
        Nombre = "Nuevo",
        Apellido = "Estudiante",
        Edad = 9,
        Grado = "4° Primaria",
        Correo = correo,
        Estado = "Activo"
    };

    [Fact]
    public async Task GetPaged_FiltraPorEstadoYPagina()
    {
        using var contexto = CrearContexto();
        var servicio = new EstudianteService(contexto);

        var resultado = await servicio.GetPagedAsync(null, "Activo", 1, 2, "id", "asc");

        Assert.Equal(4, resultado.Total);
        Assert.Equal(2, resultado.Items.Count);
        Assert.All(resultado.Items, e => Assert.Equal("Activo", e.Estado));
        Assert.Equal(2, resultado.TotalPages);
    }

    [Fact]
    public async Task GetPaged_BuscaPorNombre()
    {
        using var contexto = CrearContexto();
        var servicio = new EstudianteService(contexto);

        var resultado = await servicio.GetPagedAsync("ana", null, 1, 10, "id", "asc");

        Assert.Single(resultado.Items);
        Assert.Equal("Ana", resultado.Items[0].Nombre);
    }

    [Fact]
    public async Task GetPaged_PaginaFueraDeRango_DevuelveLaUltimaPagina()
    {
        using var contexto = CrearContexto();
        var servicio = new EstudianteService(contexto);

        var resultado = await servicio.GetPagedAsync(null, null, int.MaxValue, 2, "id", "asc");

        Assert.Equal(3, resultado.Page);
        Assert.Single(resultado.Items);
    }

    [Fact]
    public async Task Create_AgregaEstudiante()
    {
        using var contexto = CrearContexto();
        var servicio = new EstudianteService(contexto);

        var creado = await servicio.CreateAsync(NuevoDto());

        Assert.True(creado.Id > 0);
        Assert.Equal("Nuevo", creado.Nombre);
        Assert.Equal(6, await contexto.Estudiantes.CountAsync());
    }

    [Fact]
    public async Task Create_ConCorreoDuplicado_LanzaConflictException()
    {
        using var contexto = CrearContexto();
        var servicio = new EstudianteService(contexto);

        await Assert.ThrowsAsync<ConflictException>(
            () => servicio.CreateAsync(NuevoDto("ana.torres@colegio.edu")));
    }

    [Fact]
    public async Task Create_CorreoDuplicadoSinDistinguirMayusculas_LanzaConflictException()
    {
        using var contexto = CrearContexto();
        var servicio = new EstudianteService(contexto);

        await Assert.ThrowsAsync<ConflictException>(
            () => servicio.CreateAsync(NuevoDto(" ANA.TORRES@COLEGIO.EDU ")));
    }

    [Fact]
    public async Task GetById_NoExistente_LanzaNotFoundException()
    {
        using var contexto = CrearContexto();
        var servicio = new EstudianteService(contexto);

        await Assert.ThrowsAsync<NotFoundException>(() => servicio.GetByIdAsync(999));
    }

    [Fact]
    public async Task Update_ConVersionDesactualizada_LanzaConflictException()
    {
        using var contexto = CrearContexto();
        var servicio = new EstudianteService(contexto);
        var dto = new EstudianteUpdateDto
        {
            Nombre = "Cambio",
            Apellido = "Apellido",
            Edad = 10,
            Grado = "5° Primaria",
            Correo = "cambio@colegio.edu",
            Estado = "Activo",
            Version = 99
        };

        await Assert.ThrowsAsync<ConflictException>(() => servicio.UpdateAsync(1, dto));
    }

    [Fact]
    public async Task Update_VersionCorrecta_IncrementaVersion()
    {
        using var contexto = CrearContexto();
        var servicio = new EstudianteService(contexto);
        var original = await servicio.GetByIdAsync(1);

        var dto = new EstudianteUpdateDto
        {
            Nombre = "Ana María",
            Apellido = original.Apellido,
            Edad = original.Edad,
            Grado = original.Grado,
            Correo = original.Correo,
            Estado = original.Estado,
            Version = original.Version
        };

        await servicio.UpdateAsync(1, dto);
        var actualizado = await servicio.GetByIdAsync(1);

        Assert.Equal("Ana María", actualizado.Nombre);
        Assert.Equal(original.Version + 1, actualizado.Version);
    }

    [Fact]
    public async Task Delete_RemueveEstudiante()
    {
        using var contexto = CrearContexto();
        var servicio = new EstudianteService(contexto);

        await servicio.DeleteAsync(1);

        await Assert.ThrowsAsync<NotFoundException>(() => servicio.GetByIdAsync(1));
        Assert.Equal(4, await contexto.Estudiantes.CountAsync());
    }

    [Fact]
    public async Task GetEstadisticas_CalculaTotales()
    {
        using var contexto = CrearContexto();
        var servicio = new EstudianteService(contexto);

        var estadisticas = await servicio.GetEstadisticasAsync();

        Assert.Equal(5, estadisticas.Total);
        Assert.Equal(4, estadisticas.Activos);
        Assert.Equal(1, estadisticas.Inactivos);
        Assert.NotEmpty(estadisticas.PorGrado);
    }
}
