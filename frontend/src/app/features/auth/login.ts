import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LoginSchema } from '@shared/schemas/auth.schema';
import type { ZodError } from 'zod';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { CardComponent } from '../../shared/ui/card/card';
import { InputComponent } from '../../shared/ui/input/input';
import { ButtonComponent } from '../../shared/ui/button/button';

interface FieldErrors {
  email?: string;
  password?: string;
}

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink, CardComponent, InputComponent, ButtonComponent],
  template: `
    <div class="auth-container">
      <app-card class="auth-card">
        <h1 class="auth-title">Connecte-toi</h1>

        <form (ngSubmit)="onSubmit()" class="auth-form">
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
            autocomplete="current-password"
            [error]="fieldErrors().password ?? ''"
            placeholder="Ton mot de passe"
          />

          <app-button variant="primary" type="submit" [disabled]="loading()" class="submit-btn">
            @if (loading()) {
              <span class="loading-indicator"></span>
            } @else {
              Se connecter
            }
          </app-button>
        </form>

        <div class="auth-link">
          Pas encore de compte ?
          <app-button variant="ghost" routerLink="/register" size="sm">Rejoins-nous</app-button>
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
export class LoginComponent {
  form = {
    email: '',
    password: '',
  };

  private readonly authService = inject(AuthService);
  private readonly toastService = inject(ToastService);
  private readonly _fieldErrors = signal<FieldErrors>({});
  readonly fieldErrors = this._fieldErrors.asReadonly();
  readonly serverError = this.authService.error;
  readonly loading = this.authService.loading;

  constructor() {
    effect(() => {
      const err = this.serverError();
      if (err) {
        this.toastService.error(err);
      }
    });
  }

  async onSubmit() {
    this._fieldErrors.set({});

    const result = LoginSchema.safeParse(this.form);
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

    await this.authService.login(result.data);
  }
}
