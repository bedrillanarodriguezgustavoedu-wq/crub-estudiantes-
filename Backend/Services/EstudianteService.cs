using GalyCrudBackend.Data;
using GalyCrudBackend.DTOs;
using GalyCrudBackend.Exceptions;
using GalyCrudBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace GalyCrudBackend.Services;

public class EstudianteService : IEstudianteService
{
    private readonly AppDbContext _db;

    public EstudianteService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PagedResult<Estudiante>> GetPagedAsync(
        string? search,
        string? estado,
        int page,
        int pageSize,
        string? sortBy,
        string? sortDir)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);
        var query = _db.Estudiantes.AsNoTracking().AsQueryable();

        if (!string.IsNullOrWhiteSpace(search))
        {
            var termino = search.Trim().ToLowerInvariant();
            query = query.Where(e =>
                e.Nombre.ToLower().Contains(termino) ||
                e.Apellido.ToLower().Contains(termino) ||
                e.Grado.ToLower().Contains(termino) ||
                e.Correo.ToLower().Contains(termino));
        }

        if (!string.IsNullOrWhiteSpace(estado) &&
            !estado.Equals("Todos", StringComparison.OrdinalIgnoreCase))
        {
            query = query.Where(e => e.Estado == estado);
        }

        var descendente = string.Equals(sortDir, "desc", StringComparison.OrdinalIgnoreCase);
        query = (sortBy ?? string.Empty).ToLowerInvariant() switch
        {
            "nombre" => descendente ? query.OrderByDescending(e => e.Nombre) : query.OrderBy(e => e.Nombre),
            "apellido" => descendente ? query.OrderByDescending(e => e.Apellido) : query.OrderBy(e => e.Apellido),
            "edad" => descendente ? query.OrderByDescending(e => e.Edad) : query.OrderBy(e => e.Edad),
            "grado" => descendente ? query.OrderByDescending(e => e.Grado) : query.OrderBy(e => e.Grado),
            "correo" => descendente ? query.OrderByDescending(e => e.Correo) : query.OrderBy(e => e.Correo),
            "estado" => descendente ? query.OrderByDescending(e => e.Estado) : query.OrderBy(e => e.Estado),
            _ => descendente ? query.OrderByDescending(e => e.Id) : query.OrderBy(e => e.Id)
        };

        var total = await query.CountAsync();
        var totalPages = Math.Max(1, (int)Math.Ceiling(total / (double)pageSize));
        page = Math.Min(page, totalPages);
        var items = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return new PagedResult<Estudiante>
        {
            Items = items,
            Total = total,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<Estudiante> GetByIdAsync(int id)
    {
        return await _db.Estudiantes.AsNoTracking().FirstOrDefaultAsync(e => e.Id == id)
               ?? throw new NotFoundException($"No existe un estudiante con id {id}.");
    }

    public async Task<Estudiante> CreateAsync(EstudianteCreateDto dto)
    {
        var correo = dto.Correo.Trim().ToLowerInvariant();
        if (await _db.Estudiantes.AnyAsync(e => e.Correo == correo))
        {
            throw new ConflictException($"Ya existe un estudiante con el correo '{correo}'.");
        }

        var estudiante = new Estudiante
        {
            Nombre = dto.Nombre.Trim(),
            Apellido = dto.Apellido.Trim(),
            Edad = dto.Edad,
            Grado = dto.Grado.Trim(),
            Correo = correo,
            Estado = dto.Estado
        };

        _db.Estudiantes.Add(estudiante);
        await GuardarAsync(correo);
        return estudiante;
    }

    public async Task UpdateAsync(int id, EstudianteUpdateDto dto)
    {
        var estudiante = await _db.Estudiantes.FirstOrDefaultAsync(e => e.Id == id)
                         ?? throw new NotFoundException($"No existe un estudiante con id {id}.");

        if (dto.Version != estudiante.Version)
        {
            throw new ConflictException("El estudiante fue modificado por otro usuario. Recarga la página e inténtalo de nuevo.");
        }

        var correo = dto.Correo.Trim().ToLowerInvariant();
        if (await _db.Estudiantes.AnyAsync(e => e.Id != id && e.Correo == correo))
        {
            throw new ConflictException($"Ya existe un estudiante con el correo '{correo}'.");
        }

        estudiante.Nombre = dto.Nombre.Trim();
        estudiante.Apellido = dto.Apellido.Trim();
        estudiante.Edad = dto.Edad;
        estudiante.Grado = dto.Grado.Trim();
        estudiante.Correo = correo;
        estudiante.Estado = dto.Estado;
        estudiante.Version++;

        await GuardarAsync(correo);
    }

    public async Task DeleteAsync(int id)
    {
        var estudiante = await _db.Estudiantes.FirstOrDefaultAsync(e => e.Id == id)
                         ?? throw new NotFoundException($"No existe un estudiante con id {id}.");

        _db.Estudiantes.Remove(estudiante);
        await _db.SaveChangesAsync();
    }

    public async Task<EstadisticasDto> GetEstadisticasAsync()
    {
        var porGrado = await _db.Estudiantes
            .AsNoTracking()
            .GroupBy(e => e.Grado)
            .Select(g => new GradoCountDto { Grado = g.Key, Cantidad = g.Count() })
            .OrderBy(g => g.Grado)
            .ToListAsync();

        var total = await _db.Estudiantes.CountAsync();
        var activos = await _db.Estudiantes.CountAsync(e => e.Estado == "Activo");
        var promedio = total == 0 ? 0 : Math.Round(await _db.Estudiantes.AverageAsync(e => e.Edad), 1);

        return new EstadisticasDto
        {
            Total = total,
            Activos = activos,
            Inactivos = total - activos,
            EdadPromedio = promedio,
            PorGrado = porGrado
        };
    }

    private async Task GuardarAsync(string correo)
    {
        try
        {
            await _db.SaveChangesAsync();
        }
        catch (DbUpdateException)
        {
            throw new ConflictException($"Ya existe un estudiante con el correo '{correo}'.");
        }
    }
}
