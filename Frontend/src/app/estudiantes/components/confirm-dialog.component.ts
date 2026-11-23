import { Component, EventEmitter, HostListener, Input, Output } from '@angular/core';
import { Estudiante } from '../models/estudiante.model';

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  template: `
    <div class="modal-backdrop" (click)="cancelar()">
      <div class="modal modal-small" role="alertdialog" aria-modal="true"
           aria-labelledby="confirm-title" aria-describedby="confirm-description"
           (click)="$event.stopPropagation()">
        <header class="modal-header">
          <div>
            <h2 id="confirm-title">Confirmar eliminación</h2>
            <p id="confirm-description">Esta acción no se puede deshacer.</p>
          </div>
          <button type="button" class="icon-button" aria-label="Cerrar" [disabled]="deleting" (click)="cancelar()">×</button>
        </header>
        <div class="modal-body">
          <p>
            ¿Eliminar a <strong>{{ estudiante?.nombre }} {{ estudiante?.apellido }}</strong>?
          </p>
        </div>
        <footer class="modal-footer">
          <button type="button" class="btn btn-secondary" [disabled]="deleting" autofocus (click)="cancelar()">Cancelar</button>
          <button type="button" class="btn btn-danger-solid" [disabled]="deleting" [attr.aria-busy]="deleting" (click)="confirm.emit()">
            @if (deleting) {
              <span class="spinner spinner-light" aria-hidden="true"></span>
              Eliminando…
            } @else {
              Eliminar
            }
          </button>
        </footer>
      </div>
    </div>
  `,
})
export class ConfirmDialogComponent {
  @Input() estudiante: Estudiante | null = null;
  @Input() deleting = false;
  @Output() readonly confirm = new EventEmitter<void>();
  @Output() readonly cancel = new EventEmitter<void>();

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.cancelar();
  }

  cancelar(): void {
    if (!this.deleting) {
      this.cancel.emit();
    }
  }
}
