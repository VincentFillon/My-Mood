import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { GroupsService } from '../groups.service';
import { AuthService } from '../../../core/auth/auth.service';
import { CardComponent } from '../../../shared/ui/card/card';
import { ButtonComponent } from '../../../shared/ui/button/button';

@Component({
    selector: 'app-join-group',
    standalone: true,
    imports: [CommonModule, RouterModule, CardComponent, ButtonComponent],
    template: `
    <div class="min-h-[80vh] flex items-center justify-center p-4">
      <app-card class="w-full max-w-md p-8 text-center block">
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
                <app-button routerLink="/groups" variant="ghost" class="flex-1">
                  Retourner à mes groupes
                </app-button>
                <app-button (click)="requestNewLink()" variant="secondary" [disabled]="requestSent()" class="flex-1">
                  Demander un nouveau lien
                </app-button>
            </div>
        } @else {
            <div class="text-green-600 mb-6 flex flex-col items-center">
                <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mb-4"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
                <h2 class="text-xl font-bold text-foreground mb-2">Succès !</h2>
                <p class="text-sm text-foreground opacity-80 mb-6">{{ successMessage() }}</p>
            </div>
            <app-button (click)="goToGroup()" class="w-full" variant="primary">
                Accéder au groupe
            </app-button>
        }
      </app-card>
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
