import { Component, computed, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UpdateProfileSchema } from '@shared/schemas/user.schema';
import { NotificationService } from '../../core/services/notification.service';
import {
  UserProfile,
  UserService,
} from '../../core/services/user.service';
import { ProfileEditorComponent } from './profile-editor';

@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [FormsModule, ProfileEditorComponent],
  template: `
    <div class="account-page">
      <h1>Mon Compte</h1>

      @if (loading()) {
        <!-- Skeleton screens -->
        <div class="skeleton-container">
          <div class="skeleton skeleton-avatar"></div>
          <div class="skeleton skeleton-line"></div>
          <div class="skeleton skeleton-line"></div>
        </div>
      } @else if (profile()) {
        <app-profile-editor
          [avatarUrl]="profile()!.avatarUrl"
          [initials]="initials()"
          (avatarChanged)="onAvatarChanged($event)"
        />

        <form class="profile-form" (ngSubmit)="onSubmit()">
          <div class="form-group">
            <label for="name">Nom</label>
            <input
              id="name"
              type="text"
              [(ngModel)]="name"
              name="name"
              autocomplete="name"
            />
            @if (nameError()) {
              <p class="error-inline" role="alert">{{ nameError() }}</p>
            }
          </div>

          <div class="form-group">
            <label for="email">Email</label>
            <input
              id="email"
              type="email"
              [(ngModel)]="email"
              name="email"
              autocomplete="email"
            />
            @if (emailError()) {
              <p class="error-inline" role="alert">{{ emailError() }}</p>
            }
          </div>

          <button type="submit" [disabled]="submitting()">
            {{ submitting() ? 'Enregistrement...' : 'Enregistrer' }}
          </button>
        </form>
      }

      @if (notification.notification(); as notif) {
        <div class="toast" [class]="'toast-' + notif.type" role="status">
          {{ notif.message }}
        </div>
      }
    </div>
  `,
  styles: `
    .account-page {
      max-width: 480px;
      margin: 2rem auto;
      padding: 0 1rem;
    }
    h1 {
      font-size: 1.5rem;
      font-weight: 600;
      margin-bottom: 1.5rem;
    }
    .skeleton-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    .skeleton {
      background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 0.375rem;
    }
    .skeleton-avatar {
      width: 96px;
      height: 96px;
      border-radius: 50%;
    }
    .skeleton-line {
      width: 100%;
      height: 2.5rem;
    }
    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }
    .profile-form {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-top: 1.5rem;
    }
    .form-group {
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    label {
      font-size: 0.875rem;
      font-weight: 500;
      color: #334155;
    }
    input {
      padding: 0.5rem 0.75rem;
      border: 1px solid #cbd5e1;
      border-radius: 0.375rem;
      font-size: 1rem;
    }
    input:focus {
      outline: 2px solid #3b82f6;
      outline-offset: -1px;
      border-color: #3b82f6;
    }
    button[type='submit'] {
      padding: 0.625rem 1.25rem;
      background: #3b82f6;
      color: white;
      border: none;
      border-radius: 0.375rem;
      font-size: 1rem;
      cursor: pointer;
      align-self: flex-start;
    }
    button[type='submit']:hover:not(:disabled) {
      background: #2563eb;
    }
    button[type='submit']:disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }
    .error-inline {
      color: #dc2626;
      font-size: 0.875rem;
      margin: 0;
    }
    .toast {
      position: fixed;
      bottom: 1.5rem;
      right: 1.5rem;
      padding: 0.75rem 1.25rem;
      border-radius: 0.375rem;
      font-size: 0.875rem;
      color: white;
      z-index: 1000;
    }
    .toast-success {
      background: #16a34a;
    }
    .toast-error {
      background: #dc2626;
    }
  `,
})
export class AccountPageComponent implements OnInit {
  readonly loading = signal(true);
  readonly submitting = signal(false);
  readonly profile = signal<UserProfile | null>(null);
  readonly nameError = signal<string | null>(null);
  readonly emailError = signal<string | null>(null);

  name = '';
  email = '';

  readonly initials = computed(() => {
    const p = this.profile();
    if (!p?.name) return '';
    return p.name
      .split(' ')
      .map((w) => w[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  });

  constructor(
    private readonly userService: UserService,
    readonly notification: NotificationService,
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  onAvatarChanged(avatarUrl: string): void {
    const current = this.profile();
    if (current) {
      this.profile.set({ ...current, avatarUrl });
    }
    this.notification.success('Photo de profil mise à jour');
  }

  onSubmit(): void {
    this.nameError.set(null);
    this.emailError.set(null);

    const result = UpdateProfileSchema.safeParse({
      name: this.name,
      email: this.email,
    });

    if (!result.success) {
      for (const issue of result.error.issues) {
        if (issue.path[0] === 'name') {
          this.nameError.set(issue.message);
        }
        if (issue.path[0] === 'email') {
          this.emailError.set(issue.message);
        }
      }
      return;
    }

    this.submitting.set(true);

    this.userService
      .updateProfile({ name: this.name, email: this.email })
      .subscribe({
        next: (response) => {
          this.profile.set(response.data);
          this.notification.success('Profil mis à jour');
          this.submitting.set(false);
        },
        error: (err: unknown) => {
          this.submitting.set(false);
          if (this.isHttpError(err, 409)) {
            this.emailError.set('Cet email est déjà utilisé');
          } else {
            this.notification.error('Erreur lors de la mise à jour du profil');
          }
        },
      });
  }

  private loadProfile(): void {
    this.userService.getProfile().subscribe({
      next: (response) => {
        this.profile.set(response.data);
        this.name = response.data.name;
        this.email = response.data.email;
        this.loading.set(false);
      },
      error: () => {
        this.loading.set(false);
      },
    });
  }

  private isHttpError(err: unknown, status: number): boolean {
    return (
      typeof err === 'object' &&
      err !== null &&
      'status' in err &&
      (err as { status: number }).status === status
    );
  }
}
