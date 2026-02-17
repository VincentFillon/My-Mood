import { Injectable, signal } from '@angular/core';
import { Observable, Subject } from 'rxjs';

export interface ModalConfig {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  confirmVariant?: 'primary' | 'danger';
}

@Injectable({ providedIn: 'root' })
export class ModalService {
  private readonly _config = signal<ModalConfig | null>(null);
  readonly config = this._config.asReadonly();

  private resultSubject: Subject<boolean> | null = null;

  confirm(title: string, message: string, confirmLabel?: string): Observable<boolean> {
    return this.open({ title, message, confirmLabel });
  }

  open(config: ModalConfig): Observable<boolean> {
    this._config.set(config);
    this.resultSubject = new Subject<boolean>();
    return this.resultSubject.asObservable();
  }

  handleConfirm(): void {
    this.resultSubject?.next(true);
    this.resultSubject?.complete();
    this.resultSubject = null;
    this._config.set(null);
  }

  handleClose(): void {
    this.resultSubject?.next(false);
    this.resultSubject?.complete();
    this.resultSubject = null;
    this._config.set(null);
  }
}
