namespace GalyCrudBackend.Models;

public class Estudiante
{
    public int Id { get; set; }

    public string Nombre { get; set; } = string.Empty;

    public string Apellido { get; set; } = string.Empty;

    public int Edad { get; set; }

    public string Grado { get; set; } = string.Empty;

    public string Correo { get; set; } = string.Empty;

    public string Estado { get; set; } = "Activo";

    public int Version { get; set; }
}
