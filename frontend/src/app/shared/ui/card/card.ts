import { Component, input } from '@angular/core';

@Component({
  selector: 'app-card',
  standalone: true,
  template: `<ng-content />`,
  host: {
    '[class.card-elevated]': 'elevated()',
  },
  styles: `
    :host {
      display: block;
      border-radius: var(--radius-lg);
      padding: var(--space-4);
      background-color: var(--surface-1);
    }

    :host(.card-elevated) {
      background-color: var(--surface-2);
    }
  `,
})
export class CardComponent {
  readonly elevated = input(false);
}
