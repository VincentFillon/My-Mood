import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ModalService } from './modal.service';

describe('ModalService', () => {
  let service: ModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have no config initially', () => {
    expect(service.config()).toBeNull();
  });

  describe('open', () => {
    it('should set config when opened', () => {
      service.open({ title: 'Test', message: 'Hello' });
      expect(service.config()).toEqual({ title: 'Test', message: 'Hello' });
    });

    it('should return an observable', () => {
      const result$ = service.open({ title: 'T', message: 'M' });
      expect(result$).toBeTruthy();
      expect(typeof result$.subscribe).toBe('function');
    });
  });

  describe('confirm', () => {
    it('should set config with title and message', () => {
      service.confirm('Delete', 'Are you sure?');
      expect(service.config()?.title).toBe('Delete');
      expect(service.config()?.message).toBe('Are you sure?');
    });

    it('should support custom confirmLabel', () => {
      service.confirm('Delete', 'Are you sure?', 'Yes, delete');
      expect(service.config()?.confirmLabel).toBe('Yes, delete');
    });
  });

  describe('handleConfirm', () => {
    it('should emit true and complete', () => {
      const resultSpy = vi.fn();
      const completeSpy = vi.fn();
      service.confirm('T', 'M').subscribe({ next: resultSpy, complete: completeSpy });

      service.handleConfirm();

      expect(resultSpy).toHaveBeenCalledWith(true);
      expect(completeSpy).toHaveBeenCalled();
    });

    it('should clear config after confirm', () => {
      service.confirm('T', 'M');
      service.handleConfirm();
      expect(service.config()).toBeNull();
    });
  });

  describe('handleClose', () => {
    it('should emit false and complete', () => {
      const resultSpy = vi.fn();
      const completeSpy = vi.fn();
      service.confirm('T', 'M').subscribe({ next: resultSpy, complete: completeSpy });

      service.handleClose();

      expect(resultSpy).toHaveBeenCalledWith(false);
      expect(completeSpy).toHaveBeenCalled();
    });

    it('should clear config after close', () => {
      service.confirm('T', 'M');
      service.handleClose();
      expect(service.config()).toBeNull();
    });
  });

  it('should handle multiple open/close cycles', () => {
    const spy1 = vi.fn();
    service.confirm('First', 'M').subscribe(spy1);
    service.handleConfirm();
    expect(spy1).toHaveBeenCalledWith(true);

    const spy2 = vi.fn();
    service.confirm('Second', 'M').subscribe(spy2);
    service.handleClose();
    expect(spy2).toHaveBeenCalledWith(false);
  });
});
