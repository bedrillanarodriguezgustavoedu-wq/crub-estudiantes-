import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { ApiError } from '../models/api-error.model';
import { AuthService } from '../services/auth.service';

export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const token = auth.token;

  const peticion = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(peticion).pipe(
    catchError((response: HttpErrorResponse) => {
      if (response.status === 401 && !req.url.includes('/auth/login')) {
        auth.logout();
        void router.navigate(['/login']);
      }
      return throwError(() => normalizar(response));
    })
  );
};

function normalizar(response: HttpErrorResponse): ApiError {
  const body = response.error as Record<string, unknown> | null;

  const detail = body && typeof body['detail'] === 'string' ? body['detail'] : undefined;
  const title = body && typeof body['title'] === 'string' ? body['title'] : undefined;
  const mensaje =
    detail ??
    title ??
    (typeof response.error === 'string' && response.error ? response.error : undefined) ??
    'No se pudo completar la solicitud. Revisa tu conexión e inténtalo de nuevo.';

  const campos = body && body['errors'] && typeof body['errors'] === 'object'
    ? (body['errors'] as Record<string, string[]>)
    : undefined;

  return { status: response.status, message: mensaje, fields: campos };
}
