import { Component, signal, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { RegisterSchema } from '@shared/schemas/auth.schema';
import type { RegisterInput } from '@shared/schemas/auth.schema';
import { AuthService } from '../../core/auth/auth.service';
import type { ZodError } from 'zod';

interface FieldErrors {
  name?: string;
  email?: string;
  password?: string;
  gdprConsent?: string;
}

@Component({
  selector: 'app-register',
  imports: [FormsModule, RouterLink],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-[#0f0f0f] px-4">
      <div class="w-full max-w-[400px] rounded-2xl bg-[#1a1a1a] p-8 max-sm:rounded-none max-sm:p-4">
        <h1 class="mb-6 text-center text-2xl font-bold text-white">
          Rejoins My Mood
        </h1>

        <form (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
          <!-- Name -->
          <div>
            <label for="name" class="mb-1 block text-sm text-[#a0a0a0]">Nom</label>
            <input
              id="name"
              type="text"
              [(ngModel)]="form.name"
              name="name"
              autocomplete="name"
              class="h-11 w-full rounded-lg border border-[#2a2a2a] bg-[#242424] px-3 text-white placeholder-[#666] focus:border-[#6c63ff] focus:outline-none focus:ring-1 focus:ring-[#6c63ff]/50"
              [class.border-[#F44336]]="fieldErrors().name"
              [attr.aria-invalid]="fieldErrors().name ? 'true' : null"
              [attr.aria-describedby]="fieldErrors().name ? 'name-error' : null"
              placeholder="Ton nom"
            />
            @if (fieldErrors().name) {
              <p id="name-error" class="mt-1 text-xs text-[#F44336]">{{ fieldErrors().name }}</p>
            }
          </div>

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
              autocomplete="new-password"
              class="h-11 w-full rounded-lg border border-[#2a2a2a] bg-[#242424] px-3 text-white placeholder-[#666] focus:border-[#6c63ff] focus:outline-none focus:ring-1 focus:ring-[#6c63ff]/50"
              [class.border-[#F44336]]="fieldErrors().password"
              [attr.aria-invalid]="fieldErrors().password ? 'true' : null"
              [attr.aria-describedby]="fieldErrors().password ? 'password-error' : null"
              placeholder="Minimum 8 caractères"
            />
            @if (fieldErrors().password) {
              <p id="password-error" class="mt-1 text-xs text-[#F44336]">{{ fieldErrors().password }}</p>
            }
          </div>

          <!-- GDPR Consent -->
          <div>
            <label class="flex min-h-[44px] cursor-pointer items-center gap-3">
              <input
                type="checkbox"
                [(ngModel)]="form.gdprConsent"
                name="gdprConsent"
                class="h-5 w-5 rounded border-[#2a2a2a] bg-[#242424] text-[#6c63ff] focus:ring-[#6c63ff]"
              />
              <span class="text-sm text-[#a0a0a0]">
                J'accepte les conditions d'utilisation et la politique de confidentialité
              </span>
            </label>
            @if (fieldErrors().gdprConsent) {
              <p class="mt-1 text-xs text-[#F44336]">{{ fieldErrors().gdprConsent }}</p>
            }
          </div>

          <!-- Server error -->
          @if (serverError()) {
            <div class="rounded-lg bg-[#F44336]/10 p-3 text-sm text-[#F44336]">
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
              Créer mon compte
            }
          </button>
        </form>

        <p class="mt-6 text-center text-sm text-[#a0a0a0]">
          Déjà un compte ?
          <a routerLink="/login" class="text-[#6c63ff] hover:underline">Connecte-toi</a>
        </p>
      </div>
    </div>
  `,
})
export class RegisterComponent {
  form: { name: string; email: string; password: string; gdprConsent: boolean } = {
    name: '',
    email: '',
    password: '',
    gdprConsent: false,
  };

  private readonly authService = inject(AuthService);
  private readonly _fieldErrors = signal<FieldErrors>({});
  readonly fieldErrors = this._fieldErrors.asReadonly();
  readonly serverError = signal<string | null>(null);
  readonly loading = this.authService.loading;

  async onSubmit() {
    this._fieldErrors.set({});
    this.serverError.set(null);

    const input: RegisterInput = {
      name: this.form.name,
      email: this.form.email,
      password: this.form.password,
      gdprConsent: this.form.gdprConsent as true,
    };

    const result = RegisterSchema.safeParse(input);
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

    try {
      await this.authService.register(result.data);
    } catch {
      this.serverError.set(this.authService.error());
    }
  }
}
