import { Component, computed, input } from '@angular/core';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'icon-only';
export type ButtonSize = 'sm' | 'md' | 'lg';

@Component({
  selector: 'app-button',
  standalone: true,
  template: `
    <button
      [type]="type()"
      [disabled]="disabled()"
      [class]="classes()"
      [attr.aria-disabled]="disabled() || null"
    >
      <ng-content />
    </button>
  `,
  styles: `
    :host {
      display: inline-block;
    }

    button {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-2);
      font-family: 'Inter', sans-serif;
      font-weight: var(--font-medium);
      cursor: pointer;
      border: none;
      transition: background-color 0.15s ease, border-color 0.15s ease, opacity 0.15s ease;
      outline: none;
    }

    @media (prefers-reduced-motion: reduce) {
      button {
        transition: none;
      }
    }

    button:focus-visible {
      outline: 2px solid var(--accent-primary);
      outline-offset: 2px;
    }

    button:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    /* ── Sizes ── */
    .btn-sm {
      height: 36px;
      min-width: 36px;
      padding: 0 var(--space-3);
      font-size: var(--text-sm);
      border-radius: var(--radius-md);
    }

    .btn-md {
      height: 44px;
      min-width: 44px;
      padding: 0 var(--space-4);
      font-size: var(--text-base);
      border-radius: var(--radius-md);
    }

    .btn-lg {
      height: 52px;
      min-width: 52px;
      padding: 0 var(--space-6);
      font-size: var(--text-lg);
      border-radius: var(--radius-md);
    }

    /* ── Variants ── */
    .btn-primary {
      background-color: var(--accent-primary);
      color: #ffffff;
    }

    .btn-primary:hover:not(:disabled) {
      filter: brightness(1.1);
    }

    .btn-secondary {
      background-color: transparent;
      color: var(--accent-primary);
      border: 1px solid var(--accent-primary);
    }

    .btn-secondary:hover:not(:disabled) {
      background-color: var(--accent-glow);
    }

    .btn-ghost {
      background-color: transparent;
      color: var(--text-secondary);
    }

    .btn-ghost:hover:not(:disabled) {
      background-color: var(--surface-3);
    }

    .btn-danger {
      background-color: var(--error);
      color: #ffffff;
    }

    .btn-danger:hover:not(:disabled) {
      filter: brightness(1.1);
    }

    .btn-icon-only {
      background-color: transparent;
      color: var(--text-secondary);
      padding: 0;
    }

    .btn-icon-only:hover:not(:disabled) {
      background-color: var(--surface-3);
      border-radius: var(--radius-md);
    }
  `,
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly size = input<ButtonSize>('md');
  readonly disabled = input(false);
  readonly type = input<'button' | 'submit'>('button');

  readonly classes = computed(() => {
    const v = this.variant();
    const s = this.size();
    return `btn-${v} btn-${s}`;
  });
}
