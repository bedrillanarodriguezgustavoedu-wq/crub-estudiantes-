import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let http: HttpTestingController;

  beforeEach(() => {
    localStorage.clear();
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(AuthService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    http.verify();
    localStorage.clear();
  });

  it('login guarda la sesión y permite eliminar si es Admin', () => {
    service.login({ username: 'admin', password: 'Admin123!' }).subscribe();

    const peticion = http.expectOne('/api/auth/login');
    peticion.flush({
      token: 'token-de-prueba',
      usuario: 'admin',
      rol: 'Admin',
      expira: new Date(Date.now() + 3_600_000).toISOString(),
    });

    expect(service.isAuthenticated()).toBeTrue();
    expect(service.puedeEditar()).toBeTrue();
    expect(service.puedeEliminar()).toBeTrue();
  });

  it('logout limpia la sesión', () => {
    service.login({ username: 'admin', password: 'Admin123!' }).subscribe();
    http.expectOne('/api/auth/login').flush({
      token: 'token',
      usuario: 'admin',
      rol: 'Admin',
      expira: new Date(Date.now() + 3_600_000).toISOString(),
    });

    service.logout();

    expect(service.isAuthenticated()).toBeFalse();
    expect(service.token).toBeNull();
  });
});
