import { ChangeDetectionStrategy, Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { Clipboard } from '@angular/cdk/clipboard';
import { GroupsService } from '../groups.service.js';
import { InviteUrlResponse } from '@shared/schemas/group.schema.js';
import { MAX_GROUP_MEMBERS_FREE } from '@shared/constants/limits.js';

@Component({
  selector: 'app-group-detail',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="container mx-auto p-4 max-w-4xl mt-8">
      <div class="flex items-center justify-between mb-6">
        <div class="flex flex-col">
            <h1 class="text-3xl font-bold">
            {{ groupsService.currentGroup()?.name || 'Groupe' }}
            </h1>
            <a routerLink="/groups" class="text-sm font-medium text-muted-foreground hover:underline mt-1 inline-block">
            &larr; Retour aux groupes
            </a>
        </div>
        <button (click)="promptLeaveGroup()" class="text-sm px-4 py-2 border border-destructive text-destructive hover:bg-destructive/10 rounded-md font-medium transition-colors">
            {{ isSoleAdmin() ? 'Supprimer le groupe' : 'Quitter le groupe' }}
        </button>
      </div>
      
      <!-- Tabs -->
      <div class="border-b mb-6 flex gap-6 mt-4">
        <button 
          (click)="setActiveTab('dashboard')"
          [class.border-b-2]="activeTab() === 'dashboard'"
          [class.border-primary]="activeTab() === 'dashboard'"
          [class.text-primary]="activeTab() === 'dashboard'"
          class="pb-2 font-medium text-sm text-muted-foreground hover:text-foreground transition-colors">
          Tableau de bord
        </button>
        @if (isAdmin()) {
          <button 
            (click)="setActiveTab('members')"
            [class.border-b-2]="activeTab() === 'members'"
            [class.border-primary]="activeTab() === 'members'"
            [class.text-primary]="activeTab() === 'members'"
            class="pb-2 font-medium text-sm text-muted-foreground hover:text-foreground transition-colors">
            Membres & Administration
          </button>
        }
      </div>

      <!-- Content -->
      @if (activeTab() === 'dashboard') {
        <div class="bg-card text-card-foreground border rounded-xl shadow-sm p-6 mb-8">
          <h2 class="text-xl font-semibold mb-2">Humeur du groupe</h2>
          <p class="text-muted-foreground">Les grilles d'humeur arriveront dans les prochaines itérations.</p>
        </div>
      }

      @if (activeTab() === 'members' && isAdmin()) {
        <div class="bg-card text-card-foreground border rounded-xl shadow-sm p-6 mb-8">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-xl font-semibold">Administration des membres</h2>
            <span class="text-sm font-medium px-3 py-1 rounded-full" 
                  [ngClass]="{'bg-muted text-muted-foreground': !isFull(), 'bg-destructive/10 text-destructive': isFull()}">
              {{ groupsService.currentGroup()?.memberCount || 1 }}/{{ maxMembers }} membres
            </span>
          </div>

          <!-- Members List -->
          <div class="mb-8">
            <h3 class="text-lg font-medium mb-4">Membres du groupe</h3>
            
            @if (loadingMembers()) {
              <div class="space-y-3">
                @for (i of [1,2,3]; track i) {
                  <div class="flex items-center gap-4 p-3 border rounded-lg bg-muted/20 animate-pulse">
                    <div class="w-10 h-10 rounded-full bg-muted"></div>
                    <div class="space-y-2 flex-1">
                      <div class="h-4 bg-muted rounded w-1/4"></div>
                      <div class="h-3 bg-muted rounded w-1/3"></div>
                    </div>
                  </div>
                }
              </div>
            } @else {
              <div class="space-y-3">
                @for (member of members(); track member.id) {
                  <div class="flex items-center justify-between p-3 border rounded-lg bg-card">
                    <div class="flex items-center gap-4">
                      <div class="w-10 h-10 flex items-center justify-center rounded-full bg-primary/10 text-primary font-medium uppercase">
                        {{ member.name.charAt(0) }}
                      </div>
                      <div>
                        <div class="flex items-center gap-2">
                          <p class="font-medium">{{ member.name }}</p>
                          @if (member.role === 'creator_admin') {
                            <span class="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary">Admin</span>
                          }
                        </div>
                        <p class="text-sm text-muted-foreground">{{ member.email }}</p>
                        <p class="text-xs text-muted-foreground mt-0.5">Ajouté le {{ member.joinedAt | date:'shortDate' }}</p>
                      </div>
                    </div>
                    @if (member.role !== 'creator_admin') {
                      <button (click)="promptRemoveMember(member)" class="text-sm text-destructive hover:underline px-3 py-1">
                        Révoquer l'accès
                      </button>
                    }
                  </div>
                }
              </div>
            }
          </div>

          <div class="border rounded-md overflow-hidden">
            <div class="bg-muted px-4 py-3 text-sm font-medium">Inviter un membre</div>
            <div class="p-4 bg-background">
              <p class="text-sm mb-4">Partagez ce lien unique avec votre équipe pour les inviter.</p>
              @if (generatedInvite()) {
                <div class="flex gap-2 mb-2">
                  <input type="text" readonly [value]="generatedInvite()?.url" class="flex-1 bg-muted/50 rounded-md border px-3 py-2 text-sm text-foreground">
                  <button (click)="copyInviteLink()" class="rounded-md bg-secondary text-secondary-foreground h-10 px-4 py-2 text-sm font-medium hover:bg-secondary/80 transition-colors">Copier</button>
                </div>
                @if (copied()) {
                    <p class="text-sm text-green-600">Lien copié dans le presse-papier !</p>
                }
              } @else {
                  <div class="flex items-center gap-4">
                    <button (click)="generateInvite()" [disabled]="loadingInvite() || isFull()" 
                            [title]="isFull() ? 'Groupe plein — ' + maxMembers + ' membres maximum en plan Free' : ''"
                            class="rounded-md bg-primary text-primary-foreground h-10 px-4 py-2 text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
                      {{ loadingInvite() ? 'Génération...' : 'Générer un lien d\\'invitation' }}
                    </button>
                    @if (isFull()) {
                      <span class="text-sm text-muted-foreground">Groupe plein — {{ maxMembers }} membres maximum.</span>
                    }
                  </div>
              }
              @if (inviteError()) {
                  <p class="text-sm text-destructive mt-2">{{ inviteError() }}</p>
              }
            </div>
          </div>
        </div>
      }

      <!-- Revoke confirmation modal -->
      @if (memberToRemove()) {
        <div class="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div class="bg-card w-full max-w-md p-6 rounded-xl shadow-lg border">
            <h3 class="text-lg font-semibold mb-2">Révoquer l'accès</h3>
            <p class="text-sm text-muted-foreground mb-6">
              Êtes-vous sûr de vouloir révoquer l'accès de <strong>{{ memberToRemove()?.name }}</strong> ? 
              Toutes ses données liées à ce groupe seront supprimées.
            </p>
            <div class="flex justify-end gap-3">
              <button (click)="memberToRemove.set(null)" [disabled]="removingMember()" class="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors">
                Annuler
              </button>
              <button (click)="confirmRemoveMember()" [disabled]="removingMember()" class="px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md transition-colors">
                {{ removingMember() ? 'Révocation...' : 'Confirmer la révocation' }}
              </button>
            </div>
            @if (removeError()) {
              <p class="text-sm text-destructive mt-4">{{ removeError() }}</p>
            }
          </div>
        </div>
      }

      <!-- Leave/Delete Group Confirmation Modal -->
      @if (showLeaveModal()) {
        <div class="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
          <div class="bg-card w-full max-w-md p-6 rounded-xl shadow-lg border">
            <h3 class="text-lg font-semibold mb-2">
                {{ isSoleAdmin() ? 'Supprimer le groupe' : 'Quitter le groupe' }}
            </h3>
            
            <div class="text-sm text-muted-foreground mb-6">
                @if (isAdmin() && !isSoleAdmin()) {
                    <p class="mb-2 text-destructive font-medium">Vous ne pouvez pas quitter le groupe car vous êtes le créateur.</p>
                    <p>Pour quitter, vous devez d'abord transférer votre rôle d'administrateur à un autre membre, ou bien supprimer tous les autres membres pour pouvoir supprimer le groupe.</p>
                } @else if (isSoleAdmin()) {
                    <p>Êtes-vous sûr de vouloir supprimer définitivement le groupe <strong>{{ groupsService.currentGroup()?.name }}</strong> ?</p>
                    <p class="mt-2 text-destructive font-medium">Cette action est irréversible et supprimera toutes les données associées.</p>
                } @else {
                    <p>Êtes-vous sûr de vouloir quitter le groupe <strong>{{ groupsService.currentGroup()?.name }}</strong> ?</p>
                    <p class="mt-2 text-destructive font-medium">Vous perdrez l'accès à toutes les données de ce groupe. Vos humeurs et messages dans ce groupe seront supprimés de façon irréversible.</p>
                    <p class="mt-2 font-medium">Note : Votre compte principal et vos données dans les autres groupes ne seront pas affectés.</p>
                }
            </div>

            <div class="flex justify-end gap-3">
              <button (click)="showLeaveModal.set(false)" [disabled]="leavingGroup()" class="px-4 py-2 text-sm font-medium hover:bg-muted rounded-md transition-colors">
                Annuler
              </button>
              @if (!isAdmin() || isSoleAdmin()) {
                <button (click)="confirmLeaveGroup()" [disabled]="leavingGroup()" class="px-4 py-2 text-sm font-medium bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md transition-colors">
                  {{ leavingGroup() ? 'En cours...' : 'Confirmer' }}
                </button>
              }
            </div>
            @if (leaveError()) {
              <p class="text-sm text-destructive mt-4">{{ leaveError() }}</p>
            }
          </div>
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupDetailComponent {
  router = inject(Router);
  groupsService = inject(GroupsService);
  activeTab = signal<'dashboard' | 'members'>('dashboard');

  clipboard = inject(Clipboard);

  generatedInvite = signal<InviteUrlResponse | null>(null);
  loadingInvite = signal(false);
  inviteError = signal<string | null>(null);
  copied = signal(false);

  maxMembers = MAX_GROUP_MEMBERS_FREE;
  members = signal<any[]>([]);
  loadingMembers = signal(false);

  memberToRemove = signal<any | null>(null);
  removingMember = signal(false);
  removeError = signal<string | null>(null);

  showLeaveModal = signal(false);
  leavingGroup = signal(false);
  leaveError = signal<string | null>(null);

  isAdmin = computed(() => this.groupsService.currentGroup()?.role === 'creator_admin');
  isFull = computed(() => (this.groupsService.currentGroup()?.memberCount || 0) >= this.maxMembers);
  isSoleAdmin = computed(() => this.isAdmin() && (this.groupsService.currentGroup()?.memberCount || 0) === 1);

  setActiveTab(tab: 'dashboard' | 'members') {
    this.activeTab.set(tab);
    if (tab === 'members' && this.members().length === 0) {
      this.fetchMembers();
    }
  }

  async fetchMembers() {
    const groupId = this.groupsService.currentGroup()?.id;
    if (!groupId) return;

    this.loadingMembers.set(true);
    try {
      const data = await this.groupsService.getGroupMembers(groupId);
      this.members.set(data);
    } catch (err) {
      console.error('Failed to load members', err);
    } finally {
      this.loadingMembers.set(false);
    }
  }

  promptRemoveMember(member: any) {
    this.memberToRemove.set(member);
    this.removeError.set(null);
  }

  async confirmRemoveMember() {
    const member = this.memberToRemove();
    const groupId = this.groupsService.currentGroup()?.id;
    if (!member || !groupId) return;

    this.removingMember.set(true);
    this.removeError.set(null);
    try {
      await this.groupsService.removeMember(groupId, member.id);

      // Update local lists
      this.members.update(list => list.filter(m => m.id !== member.id));

      // Update group count
      const current = this.groupsService.currentGroup();
      if (current) {
        this.groupsService.currentGroup.set({
          ...current,
          memberCount: Math.max(0, (current.memberCount || 1) - 1)
        });
      }

      this.memberToRemove.set(null);
      // Notice: task mentions "Toast" here if user is revoked, but since we are the admin, we just update the list.
    } catch (err: any) {
      this.removeError.set(err.error?.message || 'Erreur lors de la révocation');
    } finally {
      this.removingMember.set(false);
    }
  }

  async generateInvite() {
    const groupId = this.groupsService.currentGroup()?.id;
    if (!groupId) return;

    this.loadingInvite.set(true);
    this.inviteError.set(null);
    try {
      const invite = await this.groupsService.generateInvite(groupId);
      this.generatedInvite.set(invite);
      this.copied.set(false);
    } catch (err: any) {
      this.inviteError.set(err);
    } finally {
      this.loadingInvite.set(false);
    }
  }

  copyInviteLink() {
    const url = this.generatedInvite()?.url;
    if (url) {
      this.clipboard.copy(url);
      this.copied.set(true);
      setTimeout(() => this.copied.set(false), 3000);
    }
  }

  promptLeaveGroup() {
    this.showLeaveModal.set(true);
    this.leaveError.set(null);
  }

  async confirmLeaveGroup() {
    const groupId = this.groupsService.currentGroup()?.id;
    if (!groupId) return;

    this.leavingGroup.set(true);
    this.leaveError.set(null);

    try {
      if (this.isSoleAdmin()) {
        await this.groupsService.deleteGroup(groupId);
      } else {
        await this.groupsService.leaveGroup(groupId);
      }

      // Remove from local groups list and navigate away
      this.groupsService.groups.update(groups => groups.filter(g => g.id !== groupId));
      this.groupsService.currentGroup.set(null);
      this.showLeaveModal.set(false);
      this.router.navigate(['/groups']);

    } catch (err: any) {
      this.leaveError.set(err.error?.message || "Erreur lors de l'opération");
    } finally {
      this.leavingGroup.set(false);
    }
  }
}
