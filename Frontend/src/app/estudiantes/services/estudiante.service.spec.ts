import { provideHttpClient } from '@angular/common/http';
import {
  HttpTestingController,
  provideHttpClientTesting,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { EstudianteService } from './estudiante.service';

describe('EstudianteService', () => {
  let service: EstudianteService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });
    service = TestBed.inject(EstudianteService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('list envía los parámetros de búsqueda y paginación', () => {
    service
      .list({
        search: 'ana',
        estado: 'Activo',
        page: 2,
        pageSize: 5,
        sortBy: 'nombre',
        sortDir: 'desc',
      })
      .subscribe();

    const peticion = http.expectOne(
      (req) => req.url === '/api/estudiantes'
    );

    expect(peticion.request.method).toBe('GET');
    expect(peticion.request.params.get('search')).toBe('ana');
    expect(peticion.request.params.get('estado')).toBe('Activo');
    expect(peticion.request.params.get('page')).toBe('2');
    expect(peticion.request.params.get('sortBy')).toBe('nombre');
    expect(peticion.request.params.get('sortDir')).toBe('desc');

    peticion.flush({ items: [], total: 0, page: 2, pageSize: 5, totalPages: 0 });
  });

  it('create envía un POST con los datos', () => {
    service
      .create({
        nombre: 'Ana',
        apellido: 'Torres',
        edad: 10,
        grado: '5° Primaria',
        correo: 'ana@colegio.edu',
        estado: 'Activo',
        version: 0,
      })
      .subscribe();

    const peticion = http.expectOne('/api/estudiantes');
    expect(peticion.request.method).toBe('POST');
    expect(peticion.request.body.nombre).toBe('Ana');

    peticion.flush({ id: 1, nombre: 'Ana' });
  });
});
