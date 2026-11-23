export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  usuario: string;
  rol: string;
  expira: string;
}

export type Rol = 'Admin' | 'Editor' | 'Viewer';

export interface Sesion {
  token: string;
  usuario: string;
  rol: Rol;
  expira: string;
}
