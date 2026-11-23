import { Component, inject } from '@angular/core';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-notifications',
  standalone: true,
  template: `
    <div class="toast-stack" aria-live="polite">
      @for (item of notifications.items(); track item.id) {
        <div class="toast" [class.toast-error]="item.type === 'error'" role="status">
          <span class="toast-icon">{{ item.type === 'error' ? '⚠' : '✓' }}</span>
          <span class="toast-message">{{ item.message }}</span>
          <button type="button" class="toast-close" aria-label="Cerrar notificación"
                  (click)="notifications.dismiss(item.id)">×</button>
        </div>
      }
    </div>
  `,
})
export class NotificationsComponent {
  readonly notifications = inject(NotificationService);
}
