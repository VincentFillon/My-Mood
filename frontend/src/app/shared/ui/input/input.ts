import { Component, computed, input } from '@angular/core';
import { FormsModule } from '@angular/forms';

let nextId = 0;

@Component({
  selector: 'app-input',
  standalone: true,
  imports: [FormsModule],
  template: `
    <div class="input-wrapper">
      @if (label()) {
        <label [for]="inputId" class="input-label">{{ label() }}</label>
      }
      <input
        [id]="inputId"
        [type]="type()"
        [placeholder]="placeholder()"
        [disabled]="disabled()"
        [value]="value()"
        [class]="inputClasses()"
        [attr.aria-invalid]="hasError() || null"
        [attr.aria-describedby]="hasError() ? errorId : null"
        (input)="onInput($event)"
      />
      @if (hasError()) {
        <p [id]="errorId" class="input-error" role="alert">{{ error() }}</p>
      }
    </div>
  `,
  styles: `
    .input-wrapper {
      display: flex;
      flex-direction: column;
      gap: var(--space-1);
    }

    .input-label {
      font-size: var(--text-sm);
      font-weight: var(--font-medium);
      color: var(--text-primary);
    }

    input {
      height: 44px;
      padding: 0 var(--space-3);
      background-color: var(--surface-2);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      color: var(--text-primary);
      font-family: 'Inter', sans-serif;
      font-size: var(--text-base);
      outline: none;
      transition: border-color 0.15s ease;
    }

    @media (prefers-reduced-motion: reduce) {
      input {
        transition: none;
      }
    }

    input::placeholder {
      color: var(--text-muted);
    }

    input:focus {
      border-color: var(--accent-primary);
    }

    input:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }

    .input-error-state {
      border-color: var(--error);
    }

    .input-error-state:focus {
      border-color: var(--error);
    }

    .input-error {
      font-size: var(--text-sm);
      color: var(--error);
      margin: 0;
    }
  `,
})
export class InputComponent {
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly type = input<string>('text');
  readonly error = input<string>('');
  readonly disabled = input(false);
  readonly value = input<string>('');

  readonly inputId = `app-input-${nextId++}`;
  readonly errorId = `${this.inputId}-error`;

  readonly hasError = computed(() => !!this.error());

  readonly inputClasses = computed(() => {
    return this.hasError() ? 'input-error-state' : '';
  });

  onInput(event: Event) {
    // Let the parent handle value binding via ngModel or formControl
    // This is a presentational component
  }
}
