import { Component, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UpdateProfileSchema } from '@shared/schemas/user.schema';
import { ToastService } from '../../core/services/toast.service';
import { ModalService } from '../../core/services/modal.service';
import {
  UserProfile,
  UserService,
} from '../../core/services/user.service';
import { ProfileEditorComponent } from './profile-editor';
import { CardComponent } from '../../shared/ui/card/card';
import { InputComponent } from '../../shared/ui/input/input';
import { ButtonComponent } from '../../shared/ui/button/button';

@Component({
  selector: 'app-account-page',
  standalone: true,
  imports: [FormsModule, ProfileEditorComponent, CardComponent, InputComponent, ButtonComponent],
  template: `
    <div class="account-page">
      <h1 class="page-title">Mon compte</h1>

      @if (loading()) {
        <div class="skeleton-container">
          <div class="skeleton skeleton-avatar"></div>
          <div class="skeleton skeleton-line"></div>
          <div class="skeleton skeleton-line"></div>
        </div>
      } @else if (loadError()) {
        <app-card class="section">
          <p class="error-text">Impossible de charger le profil. Réessaie plus tard.</p>
        </app-card>
      } @else if (profile()) {
        <!-- Section Profil -->
        <app-card class="section">
          <h2 class="section-title">Profil</h2>

          <div class="avatar-section">
            <app-profile-editor
              [avatarUrl]="profile()!.avatarUrl"
              [userName]="profile()!.name"
              (avatarChanged)="onAvatarChanged($event)"
            />
          </div>

          <form class="profile-form" (ngSubmit)="onSubmit()">
            <app-input
              label="Nom"
              type="text"
              [(ngModel)]="name"
              name="name"
              autocomplete="name"
              [error]="nameError() ?? ''"
            />

            <app-input
              label="Email"
              type="email"
              [(ngModel)]="email"
              name="email"
              autocomplete="email"
              [error]="emailError() ?? ''"
            />

            <div class="form-actions">
              <app-button variant="primary" type="submit" [disabled]="submitting()">
                {{ submitting() ? 'Enregistrement...' : 'Enregistrer' }}
              </app-button>
            </div>
          </form>
        </app-card>

        <!-- Section Sécurité -->
        <app-card class="section">
          <h2 class="section-title">Sécurité</h2>
          <app-button variant="secondary">Changer mon mot de passe</app-button>
        </app-card>

        <!-- Section Zone Danger -->
        <app-card class="section danger-card">
          <h2 class="section-title danger-title">Zone danger</h2>
          <p class="danger-text">La suppression de ton compte est irréversible. Toutes tes données seront définitivement effacées.</p>
          <app-button variant="danger" (click)="onDeleteAccount()">Supprimer mon compte</app-button>
        </app-card>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
      max-width: 600px;
      margin: 0 auto;
      padding: var(--space-6);
    }

    @media (max-width: 639px) {
      :host {
        padding: var(--space-4);
      }
    }

    .page-title {
      font-size: var(--text-2xl);
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 var(--space-6) 0;
    }

    .section {
      margin-bottom: var(--space-4);
    }

    .section-title {
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 var(--space-4) 0;
    }

    .skeleton-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-4);
    }

    .skeleton {
      background: linear-gradient(90deg, var(--surface-2) 25%, var(--surface-3) 50%, var(--surface-2) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: var(--radius-md);
    }

    @media (prefers-reduced-motion: reduce) {
      .skeleton {
        animation: none;
      }
    }

    .skeleton-avatar {
      width: 96px;
      height: 96px;
      border-radius: 50%;
    }

    .skeleton-line {
      width: 100%;
      height: 44px;
    }

    @keyframes shimmer {
      0% { background-position: 200% 0; }
      100% { background-position: -200% 0; }
    }

    .avatar-section {
      display: flex;
      justify-content: center;
      margin-bottom: var(--space-4);
    }

    .profile-form {
      display: flex;
      flex-direction: column;
      gap: var(--space-4);
    }

    .form-actions {
      display: flex;
      justify-content: flex-start;
    }

    .danger-card {
      border: 1px solid var(--error);
      border-radius: var(--radius-lg);
      overflow: hidden;
    }

    .error-text {
      color: var(--error);
      font-size: var(--text-sm);
      margin: 0;
    }

    .danger-title {
      color: var(--error) !important;
    }

    .danger-text {
      font-size: var(--text-sm);
      color: var(--text-secondary);
      margin: 0 0 var(--space-4) 0;
    }
  `,
})
export class AccountPageComponent implements OnInit {
  readonly loading = signal(true);
  readonly loadError = signal(false);
  readonly submitting = signal(false);
  readonly profile = signal<UserProfile | null>(null);
  readonly nameError = signal<string | null>(null);
  readonly emailError = signal<string | null>(null);

  name = '';
  email = '';

  private readonly userService = inject(UserService);
  private readonly toastService = inject(ToastService);
  private readonly modalService = inject(ModalService);

  ngOnInit(): void {
    this.loadProfile();
  }

  onAvatarChanged(avatarUrl: string): void {
    const current = this.profile();
    if (current) {
      this.profile.set({ ...current, avatarUrl });
    }
    this.toastService.success('Photo de profil mise à jour');
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
          this.toastService.success('Profil mis à jour');
          this.submitting.set(false);
        },
        error: (err: unknown) => {
          this.submitting.set(false);
          if (this.isHttpError(err, 409)) {
            this.emailError.set('Cet email est déjà utilisé');
          } else {
            this.toastService.error('Erreur lors de la mise à jour du profil');
          }
        },
      });
  }

  onDeleteAccount(): void {
    this.modalService.confirm(
      'Supprimer mon compte ?',
      'Cette action est irréversible. Toutes tes données seront définitivement supprimées.',
      'Supprimer',
    ).subscribe((confirmed) => {
      if (confirmed) {
        this.toastService.info('Suppression du compte non encore implémentée');
      }
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
        this.loadError.set(true);
        this.toastService.error('Impossible de charger le profil');
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
