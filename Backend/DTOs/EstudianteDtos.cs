using System.ComponentModel.DataAnnotations;

namespace GalyCrudBackend.DTOs;

public class EstudianteCreateDto
{
    [Required(ErrorMessage = "El nombre es obligatorio.")]
    [StringLength(60, ErrorMessage = "El nombre no puede superar los 60 caracteres.")]
    public string Nombre { get; set; } = string.Empty;

    [Required(ErrorMessage = "El apellido es obligatorio.")]
    [StringLength(60, ErrorMessage = "El apellido no puede superar los 60 caracteres.")]
    public string Apellido { get; set; } = string.Empty;

    [Range(3, 100, ErrorMessage = "La edad debe estar entre 3 y 100 años.")]
    public int Edad { get; set; }

    [Required(ErrorMessage = "El grado es obligatorio.")]
    [StringLength(40, ErrorMessage = "El grado no puede superar los 40 caracteres.")]
    public string Grado { get; set; } = string.Empty;

    [Required(ErrorMessage = "El correo es obligatorio.")]
    [EmailAddress(ErrorMessage = "El correo no tiene un formato válido.")]
    [StringLength(120, ErrorMessage = "El correo no puede superar los 120 caracteres.")]
    public string Correo { get; set; } = string.Empty;

    [RegularExpression("^(Activo|Inactivo)$", ErrorMessage = "El estado debe ser 'Activo' o 'Inactivo'.")]
    public string Estado { get; set; } = "Activo";
}

public class EstudianteUpdateDto : EstudianteCreateDto
{
    public int Version { get; set; }
}
