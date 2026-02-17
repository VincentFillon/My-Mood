import { A11yModule } from '@angular/cdk/a11y';
import { Component, input, output } from '@angular/core';
import { ButtonComponent } from '../button/button';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [A11yModule, ButtonComponent],
  template: `
    <div
      class="modal-backdrop"
      (click)="onBackdropClick($event)"
      (keydown.escape)="closed.emit()"
    >
      <div
        class="modal-content"
        role="dialog"
        aria-modal="true"
        [attr.aria-label]="title()"
        cdkTrapFocus
        cdkTrapFocusAutoCapture
      >
        <div class="modal-header">
          <h2 class="modal-title">{{ title() }}</h2>
        </div>
        <div class="modal-body">
          <ng-content>
            <p class="modal-message">{{ message() }}</p>
          </ng-content>
        </div>
        <div class="modal-footer">
          <app-button variant="ghost" (click)="closed.emit()">
            {{ cancelLabel() }}
          </app-button>
          <app-button [variant]="confirmVariant()" (click)="confirmed.emit()">
            {{ confirmLabel() }}
          </app-button>
        </div>
      </div>
    </div>
  `,
  styles: `
    .modal-backdrop {
      position: fixed;
      inset: 0;
      z-index: 10000;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: rgba(0, 0, 0, 0.6);
      animation: fade-in 0.15s ease-out;
    }

    @media (prefers-reduced-motion: reduce) {
      .modal-backdrop {
        animation: none;
      }
      .modal-content {
        animation: none;
      }
    }

    @keyframes fade-in {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes scale-in {
      from {
        opacity: 0;
        transform: scale(0.95);
      }
      to {
        opacity: 1;
        transform: scale(1);
      }
    }

    .modal-content {
      background-color: var(--surface-2);
      border-radius: var(--radius-lg);
      padding: var(--space-6);
      min-width: 320px;
      max-width: 480px;
      width: 90%;
      box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
      animation: scale-in 0.15s ease-out;
    }

    .modal-header {
      margin-bottom: var(--space-4);
    }

    .modal-title {
      font-size: var(--text-xl);
      font-weight: var(--font-semibold);
      color: var(--text-primary);
      margin: 0;
    }

    .modal-body {
      margin-bottom: var(--space-6);
    }

    .modal-message {
      font-size: var(--text-base);
      color: var(--text-secondary);
      margin: 0;
      line-height: var(--leading-body);
    }

    .modal-footer {
      display: flex;
      justify-content: flex-end;
      gap: var(--space-3);
    }
  `,
})
export class ModalComponent {
  readonly title = input<string>('');
  readonly message = input<string>('');
  readonly confirmLabel = input<string>('Confirmer');
  readonly cancelLabel = input<string>('Annuler');
  readonly confirmVariant = input<'primary' | 'danger'>('primary');

  readonly confirmed = output<void>();
  readonly closed = output<void>();

  onBackdropClick(event: MouseEvent): void {
    if ((event.target as HTMLElement).classList.contains('modal-backdrop')) {
      this.closed.emit();
    }
  }
}
