import { Injectable, signal } from '@angular/core';

export interface NotificationItem {
  id: number;
  type: 'success' | 'error';
  message: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _items = signal<NotificationItem[]>([]);
  private secuencia = 0;

  readonly items = this._items.asReadonly();

  success(message: string): void {
    this.push('success', message);
  }

  error(message: string): void {
    this.push('error', message);
  }

  dismiss(id: number): void {
    this._items.update((items) => items.filter((item) => item.id !== id));
  }

  private push(type: 'success' | 'error', message: string): void {
    const id = ++this.secuencia;
    this._items.update((items) => [...items, { id, type, message }]);
    setTimeout(() => this.dismiss(id), 5000);
  }
}
