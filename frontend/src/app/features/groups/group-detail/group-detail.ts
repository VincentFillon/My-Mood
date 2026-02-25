import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { GroupsService } from '../groups.service';

@Component({
  selector: 'app-group-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto p-4 max-w-4xl mt-8">
      <div class="flex items-center justify-between mb-6">
        <h1 class="text-3xl font-bold">
          {{ groupsService.currentGroup()?.name || 'Groupe' }}
        </h1>
        <a routerLink="/groups" class="text-sm font-medium text-muted-foreground hover:underline">
          &larr; Retour aux groupes
        </a>
      </div>
      
      <!-- Tabs -->
      <div class="border-b mb-6 flex gap-6 mt-4">
        <button 
          (click)="activeTab.set('dashboard')"
          [class.border-b-2]="activeTab() === 'dashboard'"
          [class.border-primary]="activeTab() === 'dashboard'"
          [class.text-primary]="activeTab() === 'dashboard'"
          class="pb-2 font-medium text-sm text-muted-foreground hover:text-foreground transition-colors">
          Tableau de bord
        </button>
        <button 
          (click)="activeTab.set('members')"
          [class.border-b-2]="activeTab() === 'members'"
          [class.border-primary]="activeTab() === 'members'"
          [class.text-primary]="activeTab() === 'members'"
          class="pb-2 font-medium text-sm text-muted-foreground hover:text-foreground transition-colors">
          Membres & Administration
        </button>
      </div>

      <!-- Content -->
      @if (activeTab() === 'dashboard') {
        <div class="bg-card text-card-foreground border rounded-xl shadow-sm p-6 mb-8">
          <h2 class="text-xl font-semibold mb-2">Humeur du groupe</h2>
          <p class="text-muted-foreground">Les grilles d'humeur arriveront dans les prochaines itérations.</p>
        </div>
      }

      @if (activeTab() === 'members') {
        <div class="bg-card text-card-foreground border rounded-xl shadow-sm p-6 mb-8">
          <h2 class="text-xl font-semibold mb-4">Administration des membres</h2>
          <p class="text-muted-foreground mb-4">Liste des membres et gestion complète à venir.</p>
          <div class="border rounded-md overflow-hidden">
            <div class="bg-muted px-4 py-3 text-sm font-medium">Inviter un membre</div>
            <div class="p-4 bg-background">
              <p class="text-sm mb-2">Partagez ce lien unique avec votre équipe pour les inviter.</p>
              <div class="flex gap-2">
                <input type="text" disabled [value]="inviteLink()" class="flex-1 bg-muted/50 rounded-md border px-3 py-2 text-sm text-muted-foreground">
                <button disabled class="rounded-md bg-secondary text-secondary-foreground h-10 px-4 py-2 text-sm font-medium opacity-50 cursor-not-allowed">Copier</button>
              </div>
            </div>
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupDetailComponent {
  groupsService = inject(GroupsService);
  activeTab = signal<'dashboard' | 'members'>('dashboard');

  inviteLink() {
    const id = this.groupsService.currentGroup()?.id || 'XXXXXX';
    return \`https://my-mood.app/invite/\${id}\`;
    }
}
