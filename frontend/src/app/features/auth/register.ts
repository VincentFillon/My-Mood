import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RegisterSchema } from '@shared/schemas/auth.schema';
import { AuthService } from '../../core/auth/auth.service';
import { CardComponent } from '../../shared/ui/card/card';
import { InputComponent } from '../../shared/ui/input/input';
import { ButtonComponent } from '../../shared/ui/button/button';
import type { ZodError } from 'zod';

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  gdprConsent?: string;
}

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink, CardComponent, InputComponent, ButtonComponent],
  template: `
    <div class="auth-container">
      <app-card class="auth-card">
        <h1 class="auth-title">Rejoins My Mood</h1>

        <form (ngSubmit)="onSubmit()" class="auth-form">
          <app-input
            label="Nom"
            type="text"
            [(ngModel)]="form.name"
            name="name"
            autocomplete="name"
            [error]="fieldErrors().name ?? ''"
            placeholder="Ton nom"
          />

          <app-input
            label="Email"
            type="email"
            [(ngModel)]="form.email"
            name="email"
            autocomplete="email"
            [error]="fieldErrors().email ?? ''"
            placeholder="ton@email.com"
          />

          <app-input
            label="Mot de passe"
            type="password"
            [(ngModel)]="form.password"
            name="password"
            autocomplete="new-password"
            [error]="fieldErrors().password ?? ''"
            placeholder="Minimum 8 caractères"
          />

          <!-- GDPR Consent -->
          <div class="gdpr-field">
            <label class="gdpr-label">
              <input
                type="checkbox"
                [(ngModel)]="form.gdprConsent"
                name="gdprConsent"
                class="gdpr-checkbox"
                [attr.aria-describedby]="fieldErrors().gdprConsent ? 'gdpr-error' : null"
                [attr.aria-invalid]="fieldErrors().gdprConsent ? true : null"
              />
              <span class="gdpr-text">
                J'accepte les conditions d'utilisation et la politique de confidentialité
              </span>
            </label>
            @if (fieldErrors().gdprConsent) {
              <p id="gdpr-error" class="field-error" role="alert">{{ fieldErrors().gdprConsent }}</p>
            }
          </div>

          <!-- Server error -->
          @if (serverError()) {
            <div class="server-error">{{ serverError() }}</div>
          }

          <!-- Submit -->
          <app-button variant="primary" type="submit" [disabled]="loading()" class="submit-btn">
            @if (loading()) {
              <span class="loading-indicator"></span>
            } @else {
              Créer mon compte
            }
          </app-button>
        </form>

        <div class="auth-link">
          Déjà un compte ?
          <app-button variant="ghost" routerLink="/login" size="sm">Connecte-toi</app-button>
        </div>
      </app-card>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }

    .auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: var(--surface-0);
      padding: var(--space-4);
    }

    .auth-card {
      width: 100%;
      max-width: 400px;
    }

    .auth-title {
      font-size: var(--text-2xl);
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 var(--space-6) 0;
      text-align: center;
    }

    .auth-form {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .gdpr-field {
      display: flex;
      flex-direction: column;
    }

    .gdpr-label {
      display: flex;
      align-items: center;
      gap: var(--space-3);
      min-height: 44px;
      cursor: pointer;
    }

    .gdpr-checkbox {
      width: 20px;
      height: 20px;
      flex-shrink: 0;
      accent-color: var(--accent-primary);
    }

    .gdpr-text {
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }

    .field-error {
      font-size: var(--text-xs);
      color: var(--error);
      margin: var(--space-1) 0 0 0;
    }

    .server-error {
      border-radius: var(--radius-md);
      background-color: color-mix(in srgb, var(--error) 10%, transparent);
      padding: var(--space-3);
      font-size: var(--text-sm);
      color: var(--error);
    }

    .submit-btn {
      display: block;
      width: 100%;
      margin-top: var(--space-2);
    }

    .submit-btn button {
      width: 100%;
    }

    .loading-indicator {
      display: inline-block;
      width: 20px;
      height: 20px;
      border-radius: var(--radius-md);
      background-color: color-mix(in srgb, currentColor 20%, transparent);
      animation: pulse 1s ease-in-out infinite;
    }

    @keyframes pulse {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }

    @media (prefers-reduced-motion: reduce) {
      .loading-indicator {
        animation: none;
      }
    }

    .auth-link {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: var(--space-1);
      margin-top: var(--space-6);
      font-size: var(--text-sm);
      color: var(--text-secondary);
    }
  `,
})
export class RegisterComponent {
  form = {
    name: '',
    email: '',
    password: '',
    gdprConsent: false,
  };

  private readonly authService = inject(AuthService);
  private readonly _fieldErrors = signal<FieldErrors>({});
  readonly fieldErrors = this._fieldErrors.asReadonly();
  readonly serverError = this.authService.error;
  readonly loading = this.authService.loading;

  async onSubmit() {
    this._fieldErrors.set({});

    const result = RegisterSchema.safeParse(this.form);
    if (!result.success) {
      const errors: FieldErrors = {};
      for (const issue of (result.error as ZodError).issues) {
        const field = issue.path[0] as keyof FieldErrors;
        if (!errors[field]) {
          errors[field] = issue.message;
        }
      }
      this._fieldErrors.set(errors);
      return;
    }

    await this.authService.register(result.data);
  }
}
