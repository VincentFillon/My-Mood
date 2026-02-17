import { Component, computed, input, signal } from '@angular/core';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';

@Component({
  selector: 'app-avatar',
  standalone: true,
  template: `
    <div [class]="classes()" [attr.aria-label]="ariaLabel()">
      @if (showImage()) {
        <img
          [src]="src()"
          [alt]="name()"
          class="avatar-img"
          (error)="onImageError()"
        />
      } @else {
        <span class="avatar-initials">{{ initials() }}</span>
      }
      @if (showStatus()) {
        <span [class]="statusClasses()"></span>
      }
    </div>
  `,
  styles: `
    :host {
      display: inline-block;
    }

    .avatar {
      position: relative;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      overflow: hidden;
    }

    .avatar-xs { width: 24px; height: 24px; }
    .avatar-sm { width: 32px; height: 32px; }
    .avatar-md { width: 40px; height: 40px; }
    .avatar-lg { width: 48px; height: 48px; }
    .avatar-xl { width: 64px; height: 64px; }

    .avatar-img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      border-radius: 50%;
    }

    .avatar-initials {
      background-color: var(--accent-primary);
      color: #ffffff;
      font-family: 'Inter', sans-serif;
      font-weight: 600;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
      user-select: none;
    }

    .avatar-xs .avatar-initials { font-size: 10px; }
    .avatar-sm .avatar-initials { font-size: 12px; }
    .avatar-md .avatar-initials { font-size: 14px; }
    .avatar-lg .avatar-initials { font-size: 16px; }
    .avatar-xl .avatar-initials { font-size: 22px; }

    .avatar-status {
      position: absolute;
      bottom: 0;
      right: 0;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      border: 2px solid var(--surface-1);
    }

    .avatar-status--online {
      background-color: var(--online, #4CAF50);
    }

    .avatar-status--offline {
      background-color: var(--offline, #666666);
    }
  `,
})
export class AvatarComponent {
  readonly name = input.required<string>();
  readonly src = input<string | null>(null);
  readonly size = input<AvatarSize>('md');
  readonly showStatus = input(false);
  readonly online = input(false);

  private readonly imageError = signal(false);

  readonly showImage = computed(() => {
    const src = this.src();
    return !!src && !this.imageError();
  });

  readonly initials = computed(() => {
    const name = this.name().trim();
    if (!name) return '';
    const parts = name.split(/\s+/);
    if (parts.length === 1) {
      return parts[0][0].toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  });

  readonly ariaLabel = computed(() => `Avatar de ${this.name()}`);

  readonly classes = computed(() => `avatar avatar-${this.size()}`);

  readonly statusClasses = computed(() => {
    const base = 'avatar-status';
    return this.online() ? `${base} avatar-status--online` : `${base} avatar-status--offline`;
  });

  onImageError(): void {
    this.imageError.set(true);
  }
}
