import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { GroupsService } from '../groups.service.js';
import { AuthService } from '../../../core/auth/auth.service.js';

@Component({
    selector: 'app-join-group',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
    <div class="min-h-[80vh] flex items-center justify-center p-4">
      <div class="bg-card w-full max-w-md p-8 rounded-xl shadow-sm border text-center">
        @if (loading()) {
            <div class="animate-pulse flex flex-col items-center py-6">
               <div class="h-12 w-12 rounded-full bg-muted mb-4"></div>
               <div class="h-6 w-3/4 bg-muted rounded mb-2"></div>
               <div class="h-4 w-1/2 bg-muted rounded"></div>
            </div>
        } @else if (error()) {
            <div class="text-destructive mb-6 flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mb-4"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>
                <h2 class="text-xl font-bold mb-2">Lien invalide ou expiré</h2>
                <p class="text-sm text-foreground opacity-80">{{ error() }}</p>
                @if (requestSent()) {
                    <p class="text-sm text-green-600 mt-4 font-medium">Une demande a été envoyée à l'administrateur du groupe.</p>
                }
            </div>
            <div class="flex flex-col sm:flex-row gap-3 w-full">
                <a routerLink="/groups" class="flex-1 inline-flex items-center justify-center rounded-md border border-input bg-background text-foreground h-10 px-4 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground">
                  Retourner à mes groupes
                </a>
                <button (click)="requestNewLink()" [disabled]="requestSent()" class="flex-1 inline-flex items-center justify-center rounded-md bg-secondary text-secondary-foreground h-10 px-4 py-2 text-sm font-medium transition-colors hover:bg-secondary/80 disabled:opacity-50">
                  Demander un nouveau lien
                </button>
            </div>
        } @else {
            <div class="text-green-600 mb-6 flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mb-4"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <h2 class="text-xl font-bold text-foreground mb-2">Succès !</h2>
                <p class="text-sm text-foreground opacity-80 mb-6">{{ successMessage() }}</p>
            </div>
            <button (click)="goToGroup()" class="w-full inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground h-10 px-4 py-2 text-sm font-medium transition-colors hover:bg-primary/90">
                Accéder au groupe
            </button>
        }
      </div>
    </div>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class JoinGroupComponent implements OnInit {
    route = inject(ActivatedRoute);
    router = inject(Router);
    groupsService = inject(GroupsService);
    authService = inject(AuthService);

    loading = signal(true);
    error = signal<string | null>(null);
    successMessage = signal<string | null>(null);
    joinedGroupId = signal<string | null>(null);
    requestSent = signal(false);

    async ngOnInit() {
        const token = this.route.snapshot.paramMap.get('token');
        if (!token) {
            this.error.set("Aucun token d'invitation fourni.");
            this.loading.set(false);
            return;
        }

        // Si non connecté:
        if (!this.authService.isAuthenticated()) {
            localStorage.setItem('pendingInviteToken', token);
            // Wait for auth page component to mount
            await this.router.navigate(['/register'], { queryParams: { invite: token } });
            return;
        }

        // Si connecté:
        try {
            const result = await this.groupsService.joinGroup(token);
            this.successMessage.set(result.message);
            this.joinedGroupId.set(result.groupId);
        } catch (err: any) {
            this.error.set(err?.error?.message || "Impossible de rejoindre le groupe avec ce lien.");
        } finally {
            this.loading.set(false);
        }
    }

    goToGroup() {
        const groupId = this.joinedGroupId();
        if (groupId) {
            this.groupsService.fetchGroups();
            this.router.navigate(['/groups', groupId]);
        } else {
            this.router.navigate(['/groups']);
        }
    }

    requestNewLink() {
        this.requestSent.set(true);
    }
}
