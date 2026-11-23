import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { ApiError } from '../models/api-error.model';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule],
  template: `
    <section class="login-page">
      <form class="login-card" [formGroup]="form" (ngSubmit)="submit()">
        <div class="login-brand">
          <span class="login-logo" aria-hidden="true">G</span>
          <span class="login-kicker">PORTAL ACADÉMICO</span>
        </div>
        <h1>Bienvenido</h1>
        <p class="login-sub">Inicia sesión para continuar al directorio estudiantil.</p>

        @if (error) {
          <div class="login-error" role="alert">{{ error }}</div>
        }

        <label for="login-username">
          Usuario
          <input id="login-username" formControlName="username" autocomplete="username" placeholder="Tu usuario" required />
        </label>

        <label for="login-password">
          Contraseña
          <span class="password-control">
            <input id="login-password" formControlName="password" [type]="mostrarContrasena() ? 'text' : 'password'" autocomplete="current-password" placeholder="Tu contraseña" required />
            <button type="button" class="password-toggle" [attr.aria-label]="mostrarContrasena() ? 'Ocultar contraseña' : 'Mostrar contraseña'" (click)="toggleContrasena()">
              {{ mostrarContrasena() ? 'Ocultar' : 'Mostrar' }}
            </button>
          </span>
        </label>

        <button type="submit" class="btn btn-primary login-submit" [disabled]="cargando() || form.invalid" [attr.aria-busy]="cargando()">
          @if (cargando()) {
            <span class="spinner spinner-light" aria-hidden="true"></span>
            Verificando acceso…
          } @else {
            Iniciar sesión
            <span aria-hidden="true">→</span>
          }
        </button>

        @if (!environment.production) {
          <p class="login-hint">
            <strong>Acceso de desarrollo:</strong>
            <code>admin</code> / <code>Admin123!</code>
          </p>
        }
      </form>
    </section>
  `,
  styles: [
    `
      .login-page {
        min-height: 100vh;
        display: grid;
        place-items: center;
        padding: 28px 20px;
        background:
          radial-gradient(ellipse at 75% 16%, rgb(101 184 194 / 19%), transparent 29rem),
          linear-gradient(140deg, #123b55, #155e75 60%, #0e7490);
      }
      .login-card {
        width: min(100%, 420px);
        display: flex;
        flex-direction: column;
        gap: 17px;
        padding: 36px;
        background: #fff;
        border: 1px solid rgb(255 255 255 / 75%);
        border-radius: 18px;
        box-shadow: 0 24px 70px rgba(7, 29, 45, 0.28);
      }
      .login-brand { display: grid; justify-items: center; gap: 10px; }
      .login-logo {
        display: grid;
        width: 56px;
        height: 56px;
        place-items: center;
        border-radius: 17px;
        background: linear-gradient(145deg, #155e75, #0e7490);
        color: #fff;
        font-size: 26px;
        font-weight: 800;
      }
      .login-kicker { color: #0e7490; font-size: 10px; font-weight: 750; letter-spacing: .14em; }
      h1 { margin: 0; color: #102a43; text-align: center; font-size: 26px; letter-spacing: -.03em; }
      .login-sub { margin: -9px 0 2px; text-align: center; color: #64758a; font-size: 13px; line-height: 1.5; }
      label { display: flex; flex-direction: column; gap: 7px; color: #344b60; font-size: 12px; font-weight: 650; }
      .password-control { position: relative; }
      .password-control input { padding-right: 75px; }
      .password-toggle {
        position: absolute;
        top: 50%;
        right: 9px;
        padding: 5px 7px;
        border: 0;
        border-radius: 5px;
        background: transparent;
        color: #0e7490;
        font-size: 11px;
        font-weight: 650;
        cursor: pointer;
        transform: translateY(-50%);
      }
      .password-toggle:hover { background: #eef7f8; }
      .login-submit { min-height: 44px; margin-top: 2px; }
      .login-error {
        padding: 10px 12px;
        border-radius: 9px;
        background: #fef2f2;
        border: 1px solid #fecaca;
        color: #b91c1c;
        font-size: 13px;
      }
      .login-hint { margin: 0; padding-top: 14px; border-top: 1px solid #edf1f5; text-align: center; color: #728397; font-size: 11px; }
      .login-hint strong { display: block; margin-bottom: 5px; color: #52657a; font-weight: 650; }
      .login-hint code { color: #155e75; font-family: inherit; font-weight: 700; }
      @media (max-width: 420px) { .login-card { padding: 28px 22px; } }
    `,
  ],
})
export class LoginComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly cargando = signal(false);
  readonly mostrarContrasena = signal(false);
  readonly environment = environment;
  error = '';

  readonly form = this.fb.group({
    username: ['', Validators.required],
    password: ['', Validators.required],
  });

  toggleContrasena(): void {
    this.mostrarContrasena.update((visible) => !visible);
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error = '';
    this.cargando.set(true);
    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.cargando.set(false);
        void this.router.navigate(['/']);
      },
      error: (fallo: ApiError) => {
        this.cargando.set(false);
        this.error = fallo.message;
      },
    });
  }
}
