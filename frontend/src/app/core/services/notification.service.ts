import { Injectable, signal } from '@angular/core';

export interface Notification {
  message: string;
  type: 'success' | 'error';
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private readonly _notification = signal<Notification | null>(null);
  readonly notification = this._notification.asReadonly();
  private dismissTimeout: ReturnType<typeof setTimeout> | null = null;

  success(message: string): void {
    this._notification.set({ message, type: 'success' });
    this.autoDismiss();
  }

  error(message: string): void {
    this._notification.set({ message, type: 'error' });
    this.autoDismiss();
  }

  dismiss(): void {
    this._notification.set(null);
  }

  private autoDismiss(): void {
    if (this.dismissTimeout) {
      clearTimeout(this.dismissTimeout);
    }
    this.dismissTimeout = setTimeout(() => this.dismiss(), 4000);
  }
}
