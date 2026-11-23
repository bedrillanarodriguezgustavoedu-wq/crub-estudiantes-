import { Component, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { NotificationsComponent } from './core/components/notifications.component';
import { AuthService } from './core/services/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, NotificationsComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class AppComponent {
  readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  cerrarSesion(): void {
    this.auth.logout();
    void this.router.navigate(['/login']);
  }

  nombreRol(rol: string): string {
    return {
      Admin: 'Administrador',
      Editor: 'Editor',
      Viewer: 'Solo consulta',
    }[rol] ?? rol;
  }
}
