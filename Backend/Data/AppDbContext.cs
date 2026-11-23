using GalyCrudBackend.Models;
using Microsoft.EntityFrameworkCore;

namespace GalyCrudBackend.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<Estudiante> Estudiantes => Set<Estudiante>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var entidad = modelBuilder.Entity<Estudiante>();

        entidad.HasKey(e => e.Id);
        entidad.Property(e => e.Nombre).IsRequired().HasMaxLength(60);
        entidad.Property(e => e.Apellido).IsRequired().HasMaxLength(60);
        entidad.Property(e => e.Grado).IsRequired().HasMaxLength(40);
        entidad.Property(e => e.Correo).IsRequired().HasMaxLength(120);
        entidad.Property(e => e.Estado).IsRequired().HasMaxLength(20);
        entidad.HasIndex(e => e.Correo).IsUnique();

        entidad.HasData(
            new Estudiante { Id = 1, Nombre = "Ana", Apellido = "Torres", Edad = 10, Grado = "5° Primaria", Correo = "ana.torres@colegio.edu", Estado = "Activo" },
            new Estudiante { Id = 2, Nombre = "Luis", Apellido = "Ramírez", Edad = 13, Grado = "2° Secundaria", Correo = "luis.ramirez@colegio.edu", Estado = "Activo" },
            new Estudiante { Id = 3, Nombre = "Sofía", Apellido = "Mendoza", Edad = 8, Grado = "3° Primaria", Correo = "sofia.mendoza@colegio.edu", Estado = "Inactivo" },
            new Estudiante { Id = 4, Nombre = "Mateo", Apellido = "Cruz", Edad = 11, Grado = "6° Primaria", Correo = "mateo.cruz@colegio.edu", Estado = "Activo" },
            new Estudiante { Id = 5, Nombre = "Valeria", Apellido = "Rojas", Edad = 15, Grado = "4° Secundaria", Correo = "valeria.rojas@colegio.edu", Estado = "Activo" }
        );
    }
}
