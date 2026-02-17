import { Component, computed, input, output } from '@angular/core';
import { ToastVariant } from '../../../core/services/toast.service';

const VARIANT_ICONS: Record<ToastVariant, string> = {
  success: '\u2713',
  error: '\u2717',
  warning: '\u26A0',
  info: '\u2139',
};

@Component({
  selector: 'app-toast',
  standalone: true,
  template: `
    <div [class]="'toast toast-' + variant()" role="alert">
      <span class="toast-icon">{{ icon() }}</span>
      <span class="toast-message">{{ message() }}</span>
      <button class="toast-close" (click)="closed.emit()" aria-label="Fermer">&times;</button>
    </div>
  `,
  styles: `
    :host {
      display: block;
      pointer-events: auto;
    }

    .toast {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      padding: var(--space-3) var(--space-4);
      border-radius: var(--radius-md);
      font-family: 'Inter', sans-serif;
      font-size: var(--text-sm);
      color: var(--text-primary);
      min-width: 280px;
      max-width: 420px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
      animation: slide-in 0.2s ease-out;
    }

    @media (prefers-reduced-motion: reduce) {
      .toast {
        animation: none;
      }
    }

    @keyframes slide-in {
      from {
        opacity: 0;
        transform: translateY(-8px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    .toast-success {
      background-color: var(--surface-2);
      border-left: 3px solid var(--success);
    }

    .toast-error {
      background-color: var(--surface-2);
      border-left: 3px solid var(--error);
    }

    .toast-warning {
      background-color: var(--surface-2);
      border-left: 3px solid var(--warning);
    }

    .toast-info {
      background-color: var(--surface-2);
      border-left: 3px solid var(--info);
    }

    .toast-icon {
      font-size: var(--text-lg);
      flex-shrink: 0;
    }

    .toast-message {
      flex: 1;
    }

    .toast-close {
      background: none;
      border: none;
      color: var(--text-muted);
      cursor: pointer;
      font-size: var(--text-lg);
      padding: 0;
      line-height: 1;
    }

    .toast-close:hover {
      color: var(--text-primary);
    }
  `,
})
export class ToastComponent {
  readonly message = input.required<string>();
  readonly variant = input.required<ToastVariant>();
  readonly closed = output<void>();

  readonly icon = computed(() => VARIANT_ICONS[this.variant()] ?? '');
}
