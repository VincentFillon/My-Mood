import { Component, computed, input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `
    <div [class]="classes()">
      <ng-content />
    </div>
  `,
  styles: `
    div {
      border-radius: var(--radius-lg);
      padding: var(--space-4);
    }

    .card-default {
      background-color: var(--surface-1);
    }

    .card-elevated {
      background-color: var(--surface-2);
    }
  `,
})
export class CardComponent {
  readonly elevated = input(false);

  readonly classes = computed(() => {
    return this.elevated() ? 'card-elevated' : 'card-default';
  });
}
