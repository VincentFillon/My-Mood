import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CdkMenuTrigger, CdkMenu, CdkMenuItem } from '@angular/cdk/menu';
import { AuthService } from '../../auth/auth.service';
import { AvatarComponent } from '../../../shared/ui/avatar/avatar';

@Component({
  selector: 'app-header',
  standalone: true,
  imports: [RouterLink, CdkMenuTrigger, CdkMenu, CdkMenuItem, AvatarComponent],
  template: `
    <header class="header">
      <nav aria-label="Navigation principale">
        <div class="header-inner">
          <a routerLink="/" class="header-logo">My Mood</a>

          @let user = authService.currentUser();
          @if (user) {
            <button
              [cdkMenuTriggerFor]="accountMenu"
              class="avatar-trigger"
              aria-label="Menu compte"
            >
              <app-avatar [name]="user.name" size="md" />
            </button>

            <ng-template #accountMenu>
              <div cdkMenu class="account-menu">
                <div class="menu-header">
                  <span class="menu-user-name">{{ user.name }}</span>
                  <span class="menu-user-email">{{ user.email }}</span>
                </div>
                <hr class="menu-separator" />
                <a cdkMenuItem routerLink="/account" class="menu-item">Mon compte</a>
                <button cdkMenuItem (cdkMenuItemTriggered)="onLogout()" class="menu-item menu-item--danger">
                  Déconnexion
                </button>
              </div>
            </ng-template>
          }
        </div>
      </nav>
    </header>
  `,
  styles: `
    .header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      height: 48px;
      background-color: var(--surface-1);
      border-bottom: 1px solid var(--border);
      z-index: 100;
    }

    .header-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 100%;
      padding: 0 var(--space-6);
    }

    .header-logo {
      font-size: var(--text-lg);
      font-weight: 600;
      color: var(--text-primary);
      text-decoration: none;
      transition: color 0.15s ease;
    }

    .header-logo:hover {
      color: var(--accent-primary);
    }

    @media (prefers-reduced-motion: reduce) {
      .header-logo {
        transition: none;
      }
    }

    .avatar-trigger {
      background: none;
      border: none;
      padding: 0;
      cursor: pointer;
      border-radius: 50%;
      outline: none;
    }

    .avatar-trigger:focus-visible {
      outline: 2px solid var(--accent-primary);
      outline-offset: 2px;
    }

    .account-menu {
      background-color: var(--surface-1);
      border: 1px solid var(--border);
      border-radius: var(--radius-md);
      min-width: 200px;
      padding: var(--space-2);
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .menu-header {
      display: flex;
      flex-direction: column;
      padding: var(--space-2) var(--space-3);
    }

    .menu-user-name {
      font-weight: 600;
      color: var(--text-primary);
      font-size: var(--text-sm);
    }

    .menu-user-email {
      color: var(--text-muted);
      font-size: var(--text-xs);
    }

    .menu-separator {
      border: none;
      border-top: 1px solid var(--border);
      margin: var(--space-1) 0;
    }

    .menu-item {
      display: flex;
      align-items: center;
      width: 100%;
      padding: var(--space-2) var(--space-3);
      background: none;
      border: none;
      border-radius: var(--radius-sm);
      color: var(--text-primary);
      font-family: 'Inter', sans-serif;
      font-size: var(--text-sm);
      cursor: pointer;
      text-decoration: none;
      outline: none;
    }

    .menu-item:hover,
    .menu-item:focus-visible {
      background-color: var(--surface-3);
    }

    .menu-item:focus-visible {
      outline: 2px solid var(--accent-primary);
      outline-offset: -2px;
    }

    .menu-item--danger {
      color: var(--error);
    }
  `,
})
export class HeaderComponent {
  protected readonly authService = inject(AuthService);

  async onLogout(): Promise<void> {
    await this.authService.logout();
  }
}
