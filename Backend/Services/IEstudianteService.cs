using GalyCrudBackend.DTOs;
using GalyCrudBackend.Models;

namespace GalyCrudBackend.Services;

public interface IEstudianteService
{
    Task<PagedResult<Estudiante>> GetPagedAsync(
        string? search,
        string? estado,
        int page,
        int pageSize,
        string? sortBy,
        string? sortDir);

    Task<Estudiante> GetByIdAsync(int id);

    Task<Estudiante> CreateAsync(EstudianteCreateDto dto);

    Task UpdateAsync(int id, EstudianteUpdateDto dto);

    Task DeleteAsync(int id);

    Task<EstadisticasDto> GetEstadisticasAsync();
}
