import { Component, computed, forwardRef, input, signal } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

let nextId = 0;

@Component({
  selector: 'app-input',
  standalone: true,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputComponent),
      multi: true,
    },
  ],
  template: `
    <div class="input-wrapper">
      @if (label()) {
        <label [for]="inputId" class="input-label">{{ label() }}</label>
      }
      <input
        [id]="inputId"
        [type]="type()"
        [placeholder]="placeholder()"
        [disabled]="isDisabled()"
        [value]="currentValue()"
        [class]="inputClasses()"
        [attr.aria-invalid]="hasError() || null"
        [attr.aria-describedby]="hasError() ? errorId : null"
        (input)="onInput($event)"
        (blur)="onTouched()"
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
export class InputComponent implements ControlValueAccessor {
  readonly label = input<string>('');
  readonly placeholder = input<string>('');
  readonly type = input<string>('text');
  readonly error = input<string>('');
  readonly disabled = input(false);
  readonly value = input<string>('');

  readonly inputId = `app-input-${nextId++}`;
  readonly errorId = `${this.inputId}-error`;

  private readonly _value = signal('');
  private readonly _disabled = signal(false);

  readonly currentValue = computed(() => this._value() || this.value());
  readonly isDisabled = computed(() => this._disabled() || this.disabled());
  readonly hasError = computed(() => !!this.error());

  readonly inputClasses = computed(() => {
    return this.hasError() ? 'input-error-state' : '';
  });

  private onChange: (value: string) => void = () => {};
  onTouched: () => void = () => {};

  writeValue(value: string): void {
    this._value.set(value ?? '');
  }

  registerOnChange(fn: (value: string) => void): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: () => void): void {
    this.onTouched = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this._disabled.set(isDisabled);
  }

  onInput(event: Event): void {
    const val = (event.target as HTMLInputElement).value;
    this._value.set(val);
    this.onChange(val);
  }
}
