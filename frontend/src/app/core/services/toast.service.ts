import { Injectable, signal } from '@angular/core';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
}

const MAX_VISIBLE = 3;
const AUTO_DISMISS_MS = 5000;

let nextToastId = 0;

@Injectable({ providedIn: 'root' })
export class ToastService {
  private readonly _toasts = signal<Toast[]>([]);
  readonly toasts = this._toasts.asReadonly();
  private readonly timers = new Map<number, ReturnType<typeof setTimeout>>();

  show(message: string, variant: ToastVariant): void {
    const id = nextToastId++;
    const toast: Toast = { id, message, variant };

    this._toasts.update((current) => {
      const updated = [...current, toast];
      // Keep only the last MAX_VISIBLE toasts
      return updated.slice(-MAX_VISIBLE);
    });

    const timer = setTimeout(() => this.dismiss(id), AUTO_DISMISS_MS);
    this.timers.set(id, timer);
  }

  success(message: string): void {
    this.show(message, 'success');
  }

  error(message: string): void {
    this.show(message, 'error');
  }

  warning(message: string): void {
    this.show(message, 'warning');
  }

  info(message: string): void {
    this.show(message, 'info');
  }

  dismiss(id: number): void {
    const timer = this.timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(id);
    }
    this._toasts.update((current) => current.filter((t) => t.id !== id));
  }
}
