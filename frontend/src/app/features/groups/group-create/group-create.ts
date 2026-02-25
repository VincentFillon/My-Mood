import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { GroupsService } from '../groups.service';

@Component({
    selector: 'app-group-create',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule],
    template: `
    <div class="container mx-auto p-4 max-w-md mt-12">
      <div class="bg-card text-card-foreground border rounded-xl shadow-sm p-6">
        <h1 class="text-2xl font-bold mb-2">Créer un nouveau groupe</h1>
        <p class="text-muted-foreground mb-6">Un espace dédié pour partager votre humeur avec votre équipe.</p>
        
        @if (groupsService.error()) {
          <div class="bg-destructive/10 text-destructive p-3 rounded-md mb-4 text-sm">
            {{ groupsService.error() }}
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <div class="space-y-2">
            <label for="name" class="text-sm font-medium leading-none">Nom du groupe</label>
            <input 
              id="name" 
              type="text" 
              formControlName="name"
              placeholder="Ex: Équipe Alpha, Projet X..."
              class="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              [class.border-destructive]="form.get('name')?.invalid && form.get('name')?.touched"
            >
            @if (form.get('name')?.invalid && form.get('name')?.touched) {
               <p class="text-sm text-destructive mt-1">Le nom du groupe doit contenir entre 1 et 100 caractères.</p>
            }
          </div>

          <div class="flex items-center gap-4 mt-8">
            <a routerLink="/groups" class="text-sm font-medium text-muted-foreground hover:text-foreground">Annuler</a>
            <button 
              type="submit" 
              [disabled]="form.invalid || groupsService.loading()"
              class="inline-flex items-center justify-center rounded-md bg-primary text-primary-foreground h-10 px-4 py-2 font-medium hover:bg-primary/90 disabled:opacity-50 ml-auto"
            >
              @if (groupsService.loading()) {
                <span class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-r-transparent"></span>
              }
              Créer le groupe
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupCreateComponent {
    groupsService = inject(GroupsService);
    router = inject(Router);
    fb = inject(FormBuilder);

    form = this.fb.group({
        name: ['', [Validators.required, Validators.maxLength(100)]]
    });

    async onSubmit() {
        if (this.form.invalid) return;

        try {
            const group = await this.groupsService.createGroup(this.form.value as { name: string });
            this.router.navigate(['/groups', group.id]);
        } catch (e) {
            // Error is handled in the service via Signals
        }
    }
}
