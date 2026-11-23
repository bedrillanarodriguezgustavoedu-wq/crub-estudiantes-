# GalyCrud — Gestión de estudiantes del colegio

CRUD completo de **estudiantes de colegio** con **C# / ASP.NET Core 8** y **Angular 17**, listo para desarrollo y producción.

## Características

### Backend
- Arquitectura por capas: `Controllers` → `Services` → `Data` (EF Core + SQLite).
- **SQLite + EF Core** con `EnsureCreated()` y datos de ejemplo (semilla). Persistencia real y concurrente.
- **JWT** con roles `Admin`, `Editor` y `Viewer`; contraseñas con PBKDF2 (SHA-256, 100 000 iteraciones).
- **Autorización por endpoint**: lectura pública, escritura para `Admin`/`Editor`, borrado solo para `Admin`.
- **Concurrencia optimista** con `Version` + cabecera `ETag` en `GET /{id}` y `PUT /{id}`.
- DTOs con validaciones declarativas (`DataAnnotations`) y correo único.
- Manejo global de excepciones con respuestas `ProblemDetails` (400, 401, 404, 409, 500).
- Búsqueda, filtro por estado, paginación acotada, ordenación por columnas y estadísticas.
- **Serilog** (consola + archivos rotativos diarios en `Backend/logs/`).
- Proxy de desarrollo Angular hacia la API local, CORS configurable por entorno, Swagger UI en Development y `/health`.
- Correos normalizados para evitar duplicados por diferencias entre mayúsculas y minúsculas.
- 15 pruebas xUnit con base de datos en memoria.

### Frontend
- Componentes standalone: página, formulario modal, confirmación, estadísticas, login y notificaciones.
- Formularios reactivos con validación en cliente y envío de `version` para control optimista.
- Interceptor HTTP que añade el token JWT, normaliza errores y cierra la sesión en 401.
- Guard de rutas y control de botones según el rol del usuario.
- Búsqueda con espera breve entre teclas, cancelación de solicitudes obsoletas y selección de filas por página.
- Indicadores de carga, mensajes de error con reintento y protección contra envíos duplicados.
- Inicio de sesión con opción para mostrar/ocultar la contraseña y credenciales de demostración solo en desarrollo.
- Modales accesibles: cierre con `Escape`, foco inicial, `role="dialog"`/`alertdialog`, `aria-*`.
- Tabla con `aria-sort`, paginador con `aria-current` y `aria-label`, notificaciones con `aria-live`.
- Diseño responsive, environment de desarrollo con proxy local y sustitución de producción (`apiUrl: '/api'`).
- 4 pruebas Jasmine/Karma con Chrome Headless.

## Estructura

```
E:\GalyCrud\
├── Backend\
│   ├── Controllers\     → AuthController, EstudiantesController
│   ├── DTOs\            → EstudianteDtos, PagedResult, EstadisticasDto
│   ├── Data\            → AppDbContext (EF Core + seed)
│   ├── Exceptions\      → NotFoundException, ConflictException
│   ├── Middleware\      → ExceptionMiddleware
│   ├── Models\          → Estudiante, AuthModels
│   ├── Services\        → IEstudianteService, EstudianteService, AuthService
│   ├── appsettings*.json
│   ├── Dockerfile
│   └── Program.cs
├── Backend.Tests\       → xUnit (15 pruebas)
├── Frontend\
│   ├── src\app\
│   │   ├── core\        → login, guard, interceptor, notificaciones, modelos
│   │   ├── estudiantes\ → página, componentes, servicios, modelos
│   │   └── app.*        → shell de la aplicación
│   ├── src\environments\
│   ├── Dockerfile
│   └── nginx.conf
├── .github\workflows\ci.yml
├── docker-compose.yml
├── ejecutar.bat
└── GalyCrud.sln
```

## Modelo `Estudiante`

| Campo      | Tipo   | Validación                       |
| ---------- | ------ | -------------------------------- |
| `id`       | number | Autogenerado                     |
| `nombre`   | string | Obligatorio, máx. 60 caracteres  |
| `apellido` | string | Obligatorio, máx. 60 caracteres  |
| `edad`     | number | Entre 3 y 100                    |
| `grado`    | string | Obligatorio, máx. 40 caracteres  |
| `correo`   | string | Obligatorio, email, único        |
| `estado`   | string | `Activo` o `Inactivo`            |
| `version`  | number | Control optimista (ETag)         |

## Usuarios de demostración

| Usuario    | Contraseña     | Rol     | Permisos                          |
| ---------- | -------------- | ------- | --------------------------------- |
| `admin`    | `Admin123!`    | Admin   | Leer, crear, editar y eliminar    |
| `editor`   | `Editor123!`   | Editor  | Leer, crear y editar              |
| `consulta` | `Consulta123!` | Viewer  | Solo lectura                      |

Estas credenciales y la clave JWT de ejemplo se cargan **solo en Development**. En producción, configura tu propia clave JWT (mínimo 32 bytes) y usuarios mediante variables de entorno; no reutilices las cuentas de demostración.

## Endpoints

Base: `http://localhost:5000/api`

| Método   | Ruta                                                                                    | Roles       | Descripción                    |
| -------- | --------------------------------------------------------------------------------------- | ----------- | ------------------------------ |
| `POST`   | `/auth/login`                                                                           | Público     | Obtener token JWT              |
| `GET`    | `/estudiantes?search=&estado=&page=1&pageSize=10&sortBy=id&sortDir=asc`                 | Público     | Listado paginado               |
| `GET`    | `/estudiantes/estadisticas`                                                             | Público     | Totales, promedio y por grado  |
| `GET`    | `/estudiantes/{id}`                                                                     | Autenticado | Obtener uno (devuelve `ETag`)  |
| `POST`   | `/estudiantes`                                                                          | Admin/Editor| Crear (409 si correo existe)   |
| `PUT`    | `/estudiantes/{id}`                                                                     | Admin/Editor| Actualizar (requiere `version`)|
| `DELETE` | `/estudiantes/{id}`                                                                     | Admin       | Eliminar                       |
| `GET`    | `/health`                                                                               | Público     | Estado del servicio            |

Swagger UI: `http://localhost:5000/swagger` (solo en Development).

## Ejecución local

Requiere **.NET SDK 8** y **Node.js 18+**.

```bash
# Opción 1: script (abre backend y frontend en dos ventanas)
ejecutar.bat

# Opción 2: manual
cd Backend && dotnet run
cd Frontend && npm install && npm start
```

Abre la dirección que muestra `ejecutar.bat` (4200, o 4201 si 4200 ya está ocupado) e inicia sesión con `admin` / `Admin123!`.

> En Windows, `ejecutar.bat` prepara la ruta del SDK, instala dependencias con `npm ci` si hace falta y elige un puerto libre entre 4200 y 4201. Ambos puertos están permitidos en el CORS de Development.
> Angular reenvía `/api` al backend por un proxy local, por lo que cambiar al puerto 4201 no rompe las llamadas de la interfaz.

## Pruebas

```bash
# Backend (15 pruebas xUnit)
dotnet test GalyCrud.sln

# Frontend (4 pruebas Jasmine/Karma)
cd Frontend
$env:CHROME_BIN = 'C:\Program Files\Google\Chrome\Application\chrome.exe'
npm run test:ci
```

## Docker

Levanta backend + frontend con un solo comando:

```powershell
Copy-Item .env.example .env
# Reemplaza la clave y todas las contraseñas antes de continuar.
notepad .env
docker compose up --build
```

- Frontend: `http://localhost:4200` (Nginx sirve el SPA y redirige `/api` al backend).
- API directa: `http://localhost:5000`.
- La base de datos SQLite se guarda en el volumen `backend-data`.
- Docker exige credenciales configuradas en `.env`; el archivo está excluido de Git.

## CI/CD

`.github/workflows/ci.yml` ejecuta en cada push/PR:

- **Backend**: `dotnet restore` → `build --configuration Release` → `test`.
- **Frontend**: `npm ci` → `build:prod` → `test:ci` (Chrome Headless).
- **Docker**: `docker compose build`.

## Configuración

- CORS: `Cors:Origins` en `Backend/appsettings.json` y sus versiones por entorno.
- JWT y usuarios de demostración: `Backend/appsettings.Development.json` (solo local).
- Producción/Docker: configura `Jwt__Key`, `Jwt__Issuer`, `Jwt__Audience` y `Auth__Users__*` con variables de entorno; Docker Compose usa las variables `GALY_*` de `.env`.
- Base de datos: `ConnectionStrings:DefaultConnection` (por defecto `Data Source=Data/colegio.db`).
- Logs: `Backend/logs/galycrud-yyyyMMdd.log`.
- Producción: `Frontend/src/environments/environment.production.ts` usa `/api` (mismo dominio mediante reverse proxy).
