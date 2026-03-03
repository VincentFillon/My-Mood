import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { GroupsService } from '../groups.service';
import { CardComponent } from '../../../shared/ui/card/card';
import { InputComponent } from '../../../shared/ui/input/input';
import { ButtonComponent } from '../../../shared/ui/button/button';

@Component({
    selector: 'app-group-create',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule, CardComponent, InputComponent, ButtonComponent],
    template: `
    <div class="container mx-auto p-4 max-w-md mt-12">
      <app-card>
        <h1 class="text-2xl font-bold mb-2">Créer un nouveau groupe</h1>
        <p class="text-muted-foreground mb-6">Un espace dédié pour partager votre humeur avec votre équipe.</p>
        
        @if (groupsService.error()) {
          <div class="bg-destructive/10 text-destructive p-3 rounded-md mb-4 text-sm">
            {{ groupsService.error() }}
          </div>
        }

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="flex flex-col gap-4">
          <app-input
            label="Nom du groupe"
            type="text"
            formControlName="name"
            placeholder="Ex: Équipe Alpha, Projet X..."
            [error]="(form.get('name')?.invalid && form.get('name')?.touched) ? 'Le nom du groupe doit contenir entre 1 et 100 caractères.' : ''"
          />

          <div class="flex items-center gap-4 mt-8">
            <app-button routerLink="/groups" variant="ghost" class="ml-auto block w-fit">Annuler</app-button>
            <app-button 
              type="submit" 
              variant="primary"
              [disabled]="form.invalid || groupsService.loading()"
            >
              @if (groupsService.loading()) {
                <span class="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-foreground border-r-transparent inline-block"></span>
              }
              Créer le groupe
            </app-button>
          </div>
        </form>
      </app-card>
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
