using GalyCrudBackend.DTOs;
using GalyCrudBackend.Models;
using GalyCrudBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GalyCrudBackend.Controllers;

[ApiController]
[Authorize]
[Route("api/[controller]")]
public class EstudiantesController : ControllerBase
{
    private readonly IEstudianteService _service;

    public EstudiantesController(IEstudianteService service)
    {
        _service = service;
    }

    // GET: api/estudiantes?search=ana&estado=Activo&page=1&pageSize=10&sortBy=nombre&sortDir=asc
    [HttpGet]
    [AllowAnonymous]
    public async Task<ActionResult<PagedResult<Estudiante>>> Get(
        [FromQuery] string? search,
        [FromQuery] string? estado,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? sortBy = "id",
        [FromQuery] string? sortDir = "asc")
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 50);

        return Ok(await _service.GetPagedAsync(search, estado, page, pageSize, sortBy, sortDir));
    }

    // GET: api/estudiantes/estadisticas
    [HttpGet("estadisticas")]
    [AllowAnonymous]
    public async Task<ActionResult<EstadisticasDto>> Estadisticas()
    {
        return Ok(await _service.GetEstadisticasAsync());
    }

    // GET: api/estudiantes/1
    [HttpGet("{id:int}")]
    public async Task<ActionResult<Estudiante>> Get(int id)
    {
        var estudiante = await _service.GetByIdAsync(id);
        Response.Headers.ETag = $"\"{estudiante.Version}\"";
        return Ok(estudiante);
    }

    // POST: api/estudiantes
    [HttpPost]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<ActionResult<Estudiante>> Post(EstudianteCreateDto dto)
    {
        var creado = await _service.CreateAsync(dto);
        return CreatedAtAction(nameof(Get), new { id = creado.Id }, creado);
    }

    // PUT: api/estudiantes/1
    [HttpPut("{id:int}")]
    [Authorize(Roles = "Admin,Editor")]
    public async Task<IActionResult> Put(int id, EstudianteUpdateDto dto)
    {
        await _service.UpdateAsync(id, dto);
        Response.Headers.ETag = $"\"{dto.Version + 1}\"";
        return NoContent();
    }

    // DELETE: api/estudiantes/1
    [HttpDelete("{id:int}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(int id)
    {
        await _service.DeleteAsync(id);
        return NoContent();
    }
}
