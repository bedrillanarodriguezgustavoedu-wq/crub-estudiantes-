using GalyCrudBackend.Models;

namespace GalyCrudBackend.Services;

public interface IAuthService
{
    Task<LoginResponse?> AutenticarAsync(string usuario, string password);
}
