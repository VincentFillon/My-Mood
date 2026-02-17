import { HttpEventType } from '@angular/common/http';
import { Component, inject, input, output, signal } from '@angular/core';
import { UserService } from '../../core/services/user.service';
import { AvatarComponent } from '../../shared/ui/avatar/avatar';
import { ButtonComponent } from '../../shared/ui/button/button';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024; // 10 Mo

@Component({
  selector: 'app-profile-editor',
  standalone: true,
  imports: [AvatarComponent, ButtonComponent],
  template: `
    <div class="profile-editor">
      <div class="avatar-container">
        <app-avatar
          [name]="userName()"
          [src]="avatarUrl()"
          size="xl"
        />

        <app-button variant="secondary" size="sm" (click)="fileInput.click()">
          Changer ma photo
        </app-button>
        <input
          #fileInput
          type="file"
          accept="image/jpeg,image/png,image/webp"
          class="sr-only"
          (change)="onFileSelected($event)"
        />
      </div>

      @if (uploadProgress() > 0 && uploadProgress() < 100) {
        <div class="progress-bar">
          <div class="progress-fill" [style.width.%]="uploadProgress()"></div>
        </div>
      }

      @if (errorMessage()) {
        <p class="error-message" role="alert">{{ errorMessage() }}</p>
      }
    </div>
  `,
  styles: `
    .profile-editor {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-3);
    }

    .avatar-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--space-2);
    }

    .sr-only {
      position: absolute;
      width: 1px;
      height: 1px;
      padding: 0;
      margin: -1px;
      overflow: hidden;
      clip: rect(0, 0, 0, 0);
      border: 0;
    }

    .progress-bar {
      width: 100%;
      max-width: 200px;
      height: 4px;
      background: var(--surface-3);
      border-radius: 2px;
      overflow: hidden;
    }

    .progress-fill {
      height: 100%;
      background: var(--accent-primary);
      transition: width 0.2s;
    }

    @media (prefers-reduced-motion: reduce) {
      .progress-fill {
        transition: none;
      }
    }

    .error-message {
      color: var(--error);
      font-size: var(--text-sm);
      margin: 0;
    }
  `,
})
export class ProfileEditorComponent {
  readonly avatarUrl = input<string | null>(null);
  readonly userName = input<string>('');
  readonly avatarChanged = output<string>();

  readonly uploadProgress = signal(0);
  readonly errorMessage = signal<string | null>(null);

  private readonly userService = inject(UserService);

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    // Reset
    this.errorMessage.set(null);
    this.uploadProgress.set(0);

    // Client-side validation (AC4)
    if (file.size > MAX_SIZE) {
      this.errorMessage.set('Le fichier ne doit pas dépasser 10 Mo');
      input.value = '';
      return;
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      this.errorMessage.set(
        'Format non supporté. Formats acceptés : JPEG, PNG, WebP',
      );
      input.value = '';
      return;
    }

    this.userService.uploadAvatar(file).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress.set(
            Math.round((100 * event.loaded) / event.total),
          );
        }
        if (
          event.type === HttpEventType.Response &&
          event.body?.data?.avatarUrl
        ) {
          this.avatarChanged.emit(event.body.data.avatarUrl);
          this.uploadProgress.set(0);
        }
      },
      error: () => {
        this.errorMessage.set("Échec de l'upload de l'avatar");
        this.uploadProgress.set(0);
      },
    });

    input.value = '';
  }
}
