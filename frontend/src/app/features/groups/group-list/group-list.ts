import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GroupsService } from '../groups.service';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton';

@Component({
    selector: 'app-group-list',
    standalone: true,
    imports: [CommonModule, RouterModule, SkeletonComponent],
    template: `
    <div class="container mx-auto p-4 max-w-4xl mt-8">
      <h1 class="text-3xl font-bold mb-6">Mes Groupes</h1>
      
      @if (groupsService.loading()) {
        <div class="grid gap-4 md:grid-cols-2">
          <app-skeleton class="h-32 rounded-xl"></app-skeleton>
          <app-skeleton class="h-32 rounded-xl"></app-skeleton>
        </div>
      } @else {
        @if (groupsService.groups().length === 0) {
          <div class="bg-card text-card-foreground rounded-xl border p-8 text-center shadow-sm">
            <h2 class="text-xl font-semibold mb-2">Vous n'avez aucun groupe</h2>
            <p class="text-muted-foreground mb-6">Créez votre premier groupe pour inviter votre équipe ou rejoignez un groupe existant via un lien d'invitation.</p>
            <a routerLink="/groups/create" class="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground h-10 px-4 py-2 font-medium hover:bg-primary/90">
              Créer un groupe
            </a>
          </div>
        } @else {
          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            @for (group of groupsService.groups(); track group.id) {
              <a [routerLink]="['/groups', group.id]" class="block p-6 bg-card text-card-foreground border rounded-xl shadow-sm hover:border-primary transition-colors">
                <h3 class="font-semibold text-lg">{{ group.name }}</h3>
              </a>
            }
          </div>
          <div class="mt-8 flex justify-end">
            <a routerLink="/groups/create" class="inline-flex items-center text-sm font-medium text-primary hover:underline">
              + Nouveau groupe
            </a>
          </div>
        }
      }
    </div>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupListComponent implements OnInit {
    groupsService = inject(GroupsService);

    ngOnInit() {
        this.groupsService.fetchGroups();
    }
}
