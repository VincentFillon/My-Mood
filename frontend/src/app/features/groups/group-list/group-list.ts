import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GroupsService } from '../groups.service';
import { SkeletonComponent } from '../../../shared/ui/skeleton/skeleton';
import { CardComponent } from '../../../shared/ui/card/card';
import { ButtonComponent } from '../../../shared/ui/button/button';

@Component({
  selector: 'app-group-list',
  standalone: true,
  imports: [CommonModule, RouterModule, SkeletonComponent, CardComponent, ButtonComponent],
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
          <app-card class="text-center p-8 block">
            <h2 class="text-xl font-semibold mb-2">Vous n'avez aucun groupe</h2>
            <p class="text-muted-foreground mb-6">Créez votre premier groupe pour inviter votre équipe ou rejoignez un groupe existant via un lien d'invitation.</p>
            <app-button routerLink="/groups/create" variant="primary">
              Créer un groupe
            </app-button>
          </app-card>
        } @else {
          <div class="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            @for (group of groupsService.groups(); track group.id) {
              <app-card [routerLink]="['/groups', group.id]" class="block hover:border-primary transition-colors cursor-pointer">
                <h3 class="font-semibold text-lg">{{ group.name }}</h3>
              </app-card>
            }
          </div>
          <div class="mt-8 flex justify-end">
            <app-button routerLink="/groups/create" variant="ghost" size="sm">
              + Nouveau groupe
            </app-button>
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
