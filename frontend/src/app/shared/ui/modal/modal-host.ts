import { Component, inject } from '@angular/core';
import { ModalService } from '../../../core/services/modal.service';
import { ModalComponent } from './modal';

@Component({
  selector: 'app-modal-host',
  standalone: true,
  imports: [ModalComponent],
  template: `
    @if (modalService.config(); as config) {
      <app-modal
        [title]="config.title"
        [message]="config.message"
        [confirmLabel]="config.confirmLabel ?? 'Confirmer'"
        [cancelLabel]="config.cancelLabel ?? 'Annuler'"
        [confirmVariant]="config.confirmVariant ?? 'primary'"
        (confirmed)="modalService.handleConfirm()"
        (closed)="modalService.handleClose()"
      />
    }
  `,
})
export class ModalHostComponent {
  readonly modalService = inject(ModalService);
}
