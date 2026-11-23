// En producción la API se sirve bajo el mismo dominio mediante un reverse proxy
// (por ejemplo, Nginx redirigiendo /api al backend). Ajusta según tu despliegue.
export const environment = {
  production: true,
  apiUrl: '/api',
};
