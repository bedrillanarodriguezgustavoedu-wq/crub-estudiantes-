import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  EMPTY,
  Observable,
  Subject,
  catchError,
  debounceTime,
  distinctUntilChanged,
  finalize,
  switchMap,
  tap,
} from 'rxjs';
import { ApiError } from '../core/models/api-error.model';
import { AuthService } from '../core/services/auth.service';
import { NotificationService } from '../core/services/notification.service';
import { ConfirmDialogComponent } from './components/confirm-dialog.component';
import { EstadisticasComponent } from './components/estadisticas.component';
import { EstudianteFormComponent } from './components/estudiante-form.component';
import {
  Estadisticas,
  Estudiante,
  EstudianteInput,
  EstudianteQuery,
} from './models/estudiante.model';
import { EstudianteService } from './services/estudiante.service';

@Component({
  selector: 'app-estudiantes-page',
  standalone: true,
  imports: [EstadisticasComponent, EstudianteFormComponent, ConfirmDialogComponent],
  templateUrl: './estudiantes-page.html',
  styleUrl: './estudiantes-page.css',
})
export class EstudiantesPageComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);
  private readonly service = inject(EstudianteService);
  private readonly notifications = inject(NotificationService);
  private readonly listRequests = new Subject<EstudianteQuery>();
  private readonly searchChanges = new Subject<string>();
  private lastLoadedSearch = '';
  readonly auth = inject(AuthService);

  readonly pageSizes = [8, 15, 30];
  readonly pageSize = signal(8);
  readonly estados = ['Todos', 'Activo', 'Inactivo'];

  readonly estudiantes = signal<Estudiante[]>([]);
  readonly total = signal(0);
  readonly page = signal(1);
  readonly loading = signal(false);
  readonly listError = signal('');
  readonly estadisticas = signal<Estadisticas | null>(null);
  readonly loadingStats = signal(true);
  readonly showForm = signal(false);
  readonly saving = signal(false);
  readonly deleting = signal(false);
  readonly editing = signal<Estudiante | null>(null);
  readonly pendingDelete = signal<Estudiante | null>(null);

  search = '';
  estado = 'Todos';
  sortBy = 'id';
  sortDir: 'asc' | 'desc' = 'asc';

  ngOnInit(): void {
    this.listRequests
      .pipe(
        switchMap((query) => {
          this.loading.set(true);
          this.listError.set('');
          return this.service.list(query).pipe(
            tap((resultado) => {
              this.estudiantes.set(resultado.items);
              this.total.set(resultado.total);
              this.page.set(resultado.page);
            }),
            catchError((error: ApiError) => {
              this.listError.set(error.message);
              this.notifications.error(`No se pudo cargar el listado. ${error.message}`);
              return EMPTY;
            }),
            finalize(() => this.loading.set(false))
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe();

    this.searchChanges
      .pipe(
        debounceTime(250),
        distinctUntilChanged(),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((search) => {
        if (search !== this.lastLoadedSearch) {
          this.page.set(1);
          this.load();
        }
      });

    this.load();
    this.loadEstadisticas();
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.total() / this.pageSize()));
  }

  get pages(): number[] {
    const cantidad = Math.min(5, this.totalPages);
    const inicio = Math.max(1, Math.min(this.page() - 2, this.totalPages - cantidad + 1));
    return Array.from({ length: cantidad }, (_, indice) => inicio + indice);
  }

  get desde(): number {
    return this.total() === 0 ? 0 : (this.page() - 1) * this.pageSize() + 1;
  }

  get hasta(): number {
    return Math.min(this.page() * this.pageSize(), this.total());
  }

  load(): void {
    this.lastLoadedSearch = this.search;
    this.listRequests.next({
      search: this.search,
      estado: this.estado,
      page: this.page(),
      pageSize: this.pageSize(),
      sortBy: this.sortBy,
      sortDir: this.sortDir,
    });
  }

  loadEstadisticas(): void {
    this.loadingStats.set(true);
    this.service
      .estadisticas()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (datos) => {
          this.estadisticas.set(datos);
          this.loadingStats.set(false);
        },
        error: (error: ApiError) => {
          this.loadingStats.set(false);
          this.notifications.error(error.message);
        },
      });
  }

  onSearch(valor: string): void {
    this.search = valor;
    this.searchChanges.next(valor);
  }

  onEstado(valor: string): void {
    this.estado = valor;
    this.page.set(1);
    this.load();
  }

  clearFilters(): void {
    this.search = '';
    this.estado = 'Todos';
    this.page.set(1);
    this.load();
  }

  onPageSize(valor: string): void {
    const pageSize = Number(valor);
    if (!this.pageSizes.includes(pageSize)) {
      return;
    }

    this.pageSize.set(pageSize);
    this.page.set(1);
    this.load();
  }

  sort(campo: string): void {
    if (this.sortBy === campo) {
      this.sortDir = this.sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortBy = campo;
      this.sortDir = 'asc';
    }
    this.page.set(1);
    this.load();
  }

  flecha(campo: string): string {
    if (this.sortBy !== campo) {
      return '';
    }
    return this.sortDir === 'asc' ? '▲' : '▼';
  }

  ariaSort(campo: string): 'ascending' | 'descending' | 'none' {
    if (this.sortBy !== campo) {
      return 'none';
    }
    return this.sortDir === 'asc' ? 'ascending' : 'descending';
  }

  goTo(pagina: number): void {
    if (pagina < 1 || pagina > this.totalPages || pagina === this.page()) {
      return;
    }
    this.page.set(pagina);
    this.load();
  }

  openCreate(): void {
    this.editing.set(null);
    this.showForm.set(true);
  }

  openEdit(estudiante: Estudiante): void {
    this.editing.set(estudiante);
    this.showForm.set(true);
  }

  closeForm(): void {
    this.showForm.set(false);
    this.editing.set(null);
  }

  onSaved(data: EstudianteInput): void {
    if (this.saving()) {
      return;
    }

    const estudiante = this.editing();
    const peticion: Observable<unknown> = estudiante
      ? this.service.update(estudiante.id, data)
      : this.service.create(data);

    this.saving.set(true);
    peticion.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.saving.set(false);
        this.notifications.success(
          estudiante
            ? 'Estudiante actualizado correctamente.'
            : 'Estudiante registrado correctamente.'
        );
        this.closeForm();
        this.load();
        this.loadEstadisticas();
      },
      error: (error: ApiError) => {
        this.saving.set(false);
        this.notifications.error(this.formatearError(error));
      },
    });
  }

  askDelete(estudiante: Estudiante): void {
    this.pendingDelete.set(estudiante);
  }

  cancelDelete(): void {
    this.pendingDelete.set(null);
  }

  confirmDelete(): void {
    const estudiante = this.pendingDelete();
    if (!estudiante || this.deleting()) {
      return;
    }

    this.deleting.set(true);
    this.service.delete(estudiante.id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.deleting.set(false);
        this.notifications.success('Estudiante eliminado correctamente.');
        this.pendingDelete.set(null);
        if (this.estudiantes().length === 1 && this.page() > 1) {
          this.page.update((pagina) => pagina - 1);
        }
        this.load();
        this.loadEstadisticas();
      },
      error: (error: ApiError) => {
        this.deleting.set(false);
        this.notifications.error(this.formatearError(error));
      },
    });
  }

  private formatearError(error: ApiError): string {
    const campos = error.fields ? Object.values(error.fields).flat().join(' ') : '';
    return campos ? `${error.message} ${campos}` : error.message;
  }
}
