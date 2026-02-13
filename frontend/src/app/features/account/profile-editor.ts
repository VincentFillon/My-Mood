import { HttpEventType } from '@angular/common/http';
import { Component, input, output, signal } from '@angular/core';
import { UserService } from '../../core/services/user.service';

const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_SIZE = 10 * 1024 * 1024; // 10 Mo

@Component({
  selector: 'app-profile-editor',
  standalone: true,
  template: `
    <div class="profile-editor">
      <div class="avatar-container">
        @if (avatarUrl()) {
          <img [src]="avatarUrl()" alt="Photo de profil" class="avatar" />
        } @else {
          <div class="avatar avatar-initials">{{ initials() }}</div>
        }

        <button type="button" class="btn-change-photo" (click)="fileInput.click()">
          Changer la photo
        </button>
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
        <p class="error-inline" role="alert">{{ errorMessage() }}</p>
      }
    </div>
  `,
  styles: `
    .profile-editor {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
    }
    .avatar-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.5rem;
    }
    .avatar {
      width: 96px;
      height: 96px;
      border-radius: 50%;
      object-fit: cover;
      background: #e2e8f0;
    }
    .avatar-initials {
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 2rem;
      font-weight: 600;
      color: #475569;
    }
    .btn-change-photo {
      background: none;
      border: 1px solid #cbd5e1;
      border-radius: 0.375rem;
      padding: 0.375rem 0.75rem;
      font-size: 0.875rem;
      cursor: pointer;
      color: #334155;
    }
    .btn-change-photo:hover {
      background: #f1f5f9;
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
      background: #e2e8f0;
      border-radius: 2px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: #3b82f6;
      transition: width 0.2s;
    }
    .error-inline {
      color: #dc2626;
      font-size: 0.875rem;
      margin: 0;
    }
  `,
})
export class ProfileEditorComponent {
  readonly avatarUrl = input<string | null>(null);
  readonly initials = input<string>('');
  readonly avatarChanged = output<string>();

  readonly uploadProgress = signal(0);
  readonly errorMessage = signal<string | null>(null);

  private readonly userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

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
