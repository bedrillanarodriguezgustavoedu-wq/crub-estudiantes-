import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './core/components/login.component';
import { EstudiantesPageComponent } from './estudiantes/estudiantes-page';

export const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    title: 'Iniciar sesión — Colegio Galy',
  },
  {
    path: '',
    component: EstudiantesPageComponent,
    canActivate: [authGuard],
    title: 'Estudiantes — Colegio Galy',
  },
  { path: '**', redirectTo: '' },
];
