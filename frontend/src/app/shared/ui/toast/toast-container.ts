import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, computed, inject, signal, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { ToastService } from '../../../core/services/toast.service';
import { ToastComponent } from './toast';

@Component({
  selector: 'app-toast-container',
  standalone: true,
  imports: [ToastComponent],
  template: `
    <div [class]="containerClasses()">
      @for (toast of toastService.toasts(); track toast.id) {
        <app-toast
          [message]="toast.message"
          [variant]="toast.variant"
          (closed)="toastService.dismiss(toast.id)"
        />
      }
    </div>
  `,
  styles: `
    .toast-container {
      position: fixed;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
      pointer-events: none;
    }

    .toast-container > :host ::ng-deep app-toast {
      pointer-events: auto;
    }

    .toast-top-right {
      top: var(--space-4);
      right: var(--space-4);
      align-items: flex-end;
    }

    .toast-top-center {
      top: var(--space-4);
      left: 50%;
      transform: translateX(-50%);
      align-items: center;
    }
  `,
})
export class ToastContainerComponent implements OnInit, OnDestroy {
  readonly toastService = inject(ToastService);
  private readonly breakpointObserver = inject(BreakpointObserver);
  private breakpointSub?: Subscription;

  private readonly _isMobile = signal(false);

  readonly containerClasses = computed(() => {
    const position = this._isMobile() ? 'toast-top-center' : 'toast-top-right';
    return `toast-container ${position}`;
  });

  ngOnInit(): void {
    this.breakpointSub = this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((result) => {
        this._isMobile.set(result.matches);
      });
  }

  ngOnDestroy(): void {
    this.breakpointSub?.unsubscribe();
  }
}
