using GalyCrudBackend.Models;
using GalyCrudBackend.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace GalyCrudBackend.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    // POST: api/auth/login
    [HttpPost("login")]
    [AllowAnonymous]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var resultado = await _authService.AutenticarAsync(request.Username, request.Password);
        return resultado is null
            ? Unauthorized(new { message = "Credenciales inválidas." })
            : Ok(resultado);
    }
}
