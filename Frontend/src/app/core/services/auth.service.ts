import { HttpClient } from '@angular/common/http';
import { inject, Injectable, signal } from '@angular/core';
import { Observable, tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse, Sesion } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly claveAlmacenamiento = 'galycrud.sesion';

  private readonly _sesion = signal<Sesion | null>(this.leerSesion());
  readonly sesion = this._sesion.asReadonly();

  login(datos: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${environment.apiUrl}/auth/login`, datos)
      .pipe(tap((respuesta) => this.guardarSesion(respuesta)));
  }

  logout(): void {
    localStorage.removeItem(this.claveAlmacenamiento);
    this._sesion.set(null);
  }

  get token(): string | null {
    return this._sesion()?.token ?? null;
  }

  isAuthenticated(): boolean {
    return this._sesion() !== null;
  }

  puedeEditar(): boolean {
    const rol = this._sesion()?.rol;
    return rol === 'Admin' || rol === 'Editor';
  }

  puedeEliminar(): boolean {
    return this._sesion()?.rol === 'Admin';
  }

  private guardarSesion(respuesta: LoginResponse): void {
    const sesion: Sesion = {
      token: respuesta.token,
      usuario: respuesta.usuario,
      rol: respuesta.rol as Sesion['rol'],
      expira: respuesta.expira,
    };
    localStorage.setItem(this.claveAlmacenamiento, JSON.stringify(sesion));
    this._sesion.set(sesion);
  }

  private leerSesion(): Sesion | null {
    try {
      const raw = localStorage.getItem(this.claveAlmacenamiento);
      if (!raw) {
        return null;
      }
      const sesion = JSON.parse(raw) as Sesion;
      if (new Date(sesion.expira).getTime() <= Date.now()) {
        localStorage.removeItem(this.claveAlmacenamiento);
        return null;
      }
      return sesion;
    } catch {
      return null;
    }
  }
}
