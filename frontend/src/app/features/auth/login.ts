import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LoginSchema } from '@shared/schemas/auth.schema';
import type { ZodError } from 'zod';
import { AuthService } from '../../core/auth/auth.service';

interface FieldErrors {
  email?: string;
  password?: string;
}

@Component({
  selector: 'app-login',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4">
      <div class="w-full max-w-[400px] rounded-2xl bg-[#1a1a1a] p-8 max-sm:rounded-none max-sm:p-4">
        <h1 class="mb-6 text-center text-2xl font-bold text-white">
          Connecte-toi à My Mood
        </h1>

        <form (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
          <!-- Email -->
          <div>
            <label for="email" class="mb-1 block text-sm text-[#a0a0a0]">Email</label>
            <input
              id="email"
              type="email"
              [(ngModel)]="form.email"
              name="email"
              autocomplete="email"
              class="h-11 w-full rounded-lg border border-[#2a2a2a] bg-[#242424] px-3 text-white placeholder-[#666] focus:border-[#6c63ff] focus:outline-none focus:ring-1 focus:ring-[#6c63ff]/50"
              [class.border-[#F44336]]="fieldErrors().email"
              [attr.aria-invalid]="fieldErrors().email ? 'true' : null"
              [attr.aria-describedby]="fieldErrors().email ? 'email-error' : null"
              placeholder="ton@email.com"
            />
            @if (fieldErrors().email) {
              <p id="email-error" class="mt-1 text-xs text-[#F44336]">{{ fieldErrors().email }}</p>
            }
          </div>

          <!-- Password -->
          <div>
            <label for="password" class="mb-1 block text-sm text-[#a0a0a0]">Mot de passe</label>
            <input
              id="password"
              type="password"
              [(ngModel)]="form.password"
              name="password"
              autocomplete="current-password"
              class="h-11 w-full rounded-lg border border-[#2a2a2a] bg-[#242424] px-3 text-white placeholder-[#666] focus:border-[#6c63ff] focus:outline-none focus:ring-1 focus:ring-[#6c63ff]/50"
              [class.border-[#F44336]]="fieldErrors().password"
              [attr.aria-invalid]="fieldErrors().password ? 'true' : null"
              [attr.aria-describedby]="fieldErrors().password ? 'password-error' : null"
              placeholder="Ton mot de passe"
            />
            @if (fieldErrors().password) {
              <p id="password-error" class="mt-1 text-xs text-[#F44336]">{{ fieldErrors().password }}</p>
            }
          </div>

          <!-- Server error -->
          @if (serverError()) {
            <div class="text-center text-sm text-[#F44336]">
              {{ serverError() }}
            </div>
          }

          <!-- Submit -->
          <button
            type="submit"
            [disabled]="loading()"
            class="mt-2 h-11 w-full rounded-lg bg-[#6c63ff] font-medium text-white transition-colors hover:bg-[#5a52d5] disabled:cursor-not-allowed disabled:opacity-50"
          >
            @if (loading()) {
              <span class="inline-block h-5 w-5 animate-pulse rounded bg-white/20"></span>
            } @else {
              Se connecter
            }
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-[#a0a0a0]">
          Pas encore de compte ?
          <a routerLink="/register" class="text-[#6c63ff] hover:underline">Inscris-toi</a>
        </p>
      </div>
    </div>
  `,
})
export class LoginComponent {
  form = {
    email: '',
    password: '',
  };

  private readonly authService = inject(AuthService);
  private readonly _fieldErrors = signal<FieldErrors>({});
  readonly fieldErrors = this._fieldErrors.asReadonly();
  readonly serverError = this.authService.error;
  readonly loading = this.authService.loading;

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
