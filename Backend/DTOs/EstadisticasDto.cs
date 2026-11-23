namespace GalyCrudBackend.DTOs;

public class EstadisticasDto
{
    public int Total { get; set; }

    public int Activos { get; set; }

    public int Inactivos { get; set; }

    public double EdadPromedio { get; set; }

    public IReadOnlyList<GradoCountDto> PorGrado { get; set; } = Array.Empty<GradoCountDto>();
}

public class GradoCountDto
{
    public string Grado { get; set; } = string.Empty;

    public int Cantidad { get; set; }
}
