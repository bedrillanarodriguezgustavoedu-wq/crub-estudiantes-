import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Estadisticas,
  Estudiante,
  EstudianteInput,
  EstudianteQuery,
  PagedResult,
} from '../models/estudiante.model';

@Injectable({ providedIn: 'root' })
export class EstudianteService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/estudiantes`;

  list(query: EstudianteQuery): Observable<PagedResult<Estudiante>> {
    let params = new HttpParams()
      .set('page', query.page)
      .set('pageSize', query.pageSize)
      .set('sortBy', query.sortBy)
      .set('sortDir', query.sortDir);

    if (query.search.trim()) {
      params = params.set('search', query.search.trim());
    }
    if (query.estado && query.estado !== 'Todos') {
      params = params.set('estado', query.estado);
    }

    return this.http.get<PagedResult<Estudiante>>(this.url, { params });
  }

  getById(id: number): Observable<Estudiante> {
    return this.http.get<Estudiante>(`${this.url}/${id}`);
  }

  create(data: EstudianteInput): Observable<Estudiante> {
    return this.http.post<Estudiante>(this.url, data);
  }

  update(id: number, data: EstudianteInput): Observable<void> {
    return this.http.put<void>(`${this.url}/${id}`, data);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  estadisticas(): Observable<Estadisticas> {
    return this.http.get<Estadisticas>(`${this.url}/estadisticas`);
  }
}
