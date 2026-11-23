import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuthService } from '../core/services/auth.service';
import { NotificationService } from '../core/services/notification.service';
import { EstudianteQuery } from './models/estudiante.model';
import { EstudianteService } from './services/estudiante.service';
import { EstudiantesPageComponent } from './estudiantes-page';

describe('EstudiantesPageComponent', () => {
  let list: jasmine.Spy;
  let fixture: ComponentFixture<EstudiantesPageComponent>;
  let component: EstudiantesPageComponent;

  beforeEach(() => {
    list = jasmine.createSpy('list').and.callFake((query: EstudianteQuery) =>
      of({
        items: [],
        total: 20_000,
        page: query.page,
        pageSize: query.pageSize,
        totalPages: Math.ceil(20_000 / query.pageSize),
      })
    );

    TestBed.configureTestingModule({
      imports: [EstudiantesPageComponent],
      providers: [
        {
          provide: EstudianteService,
          useValue: {
            list,
            estadisticas: () =>
              of({ total: 0, activos: 0, inactivos: 0, edadPromedio: 0, porGrado: [] }),
            create: () => of({}),
            update: () => of(undefined),
            delete: () => of(undefined),
          },
        },
        {
          provide: AuthService,
          useValue: { puedeEditar: () => false, puedeEliminar: () => false },
        },
        {
          provide: NotificationService,
          useValue: { error: () => undefined, success: () => undefined },
        },
      ],
    });

    fixture = TestBed.createComponent(EstudiantesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('espera a que termine la escritura antes de buscar', fakeAsync(() => {
    expect(list).toHaveBeenCalledTimes(1);

    component.onSearch('a');
    tick(100);
    component.onSearch('ana');
    tick(249);
    expect(list).toHaveBeenCalledTimes(1);

    tick(1);
    expect(list).toHaveBeenCalledTimes(2);
    expect((list.calls.mostRecent().args[0] as EstudianteQuery).search).toBe('ana');
  }));

  it('mantiene el paginador acotado y sincroniza la página respondida por la API', () => {
    component.goTo(900);

    expect(component.pages).toEqual([898, 899, 900, 901, 902]);

    component.page.set(3_000);
    list.and.returnValue(
      of({ items: [], total: 20_000, page: 2_500, pageSize: 8, totalPages: 2_500 })
    );
    component.load();

    expect(component.page()).toBe(2_500);
  });
});
