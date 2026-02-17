import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastService } from './toast.service';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have no toasts initially', () => {
    expect(service.toasts()).toEqual([]);
  });

  describe('show', () => {
    it('should add a toast', () => {
      service.show('Hello', 'success');
      expect(service.toasts().length).toBe(1);
      expect(service.toasts()[0].message).toBe('Hello');
      expect(service.toasts()[0].variant).toBe('success');
    });

    it('should assign unique ids', () => {
      service.show('A', 'success');
      service.show('B', 'error');
      const ids = service.toasts().map((t) => t.id);
      expect(ids[0]).not.toBe(ids[1]);
    });
  });

  describe('convenience methods', () => {
    it('success should create a success toast', () => {
      service.success('OK');
      expect(service.toasts()[0].variant).toBe('success');
    });

    it('error should create an error toast', () => {
      service.error('Fail');
      expect(service.toasts()[0].variant).toBe('error');
    });

    it('warning should create a warning toast', () => {
      service.warning('Watch out');
      expect(service.toasts()[0].variant).toBe('warning');
    });

    it('info should create an info toast', () => {
      service.info('FYI');
      expect(service.toasts()[0].variant).toBe('info');
    });
  });

  describe('max visible limit', () => {
    it('should keep only 3 toasts max', () => {
      service.success('1');
      service.success('2');
      service.success('3');
      service.success('4');
      expect(service.toasts().length).toBe(3);
      expect(service.toasts()[0].message).toBe('2');
    });

    it('should clear timer of evicted toast', () => {
      service.success('1');
      const evictedId = service.toasts()[0].id;
      service.success('2');
      service.success('3');
      service.success('4');

      // Evicted toast timer should have been cleared
      // Advancing time should not cause errors
      vi.advanceTimersByTime(6000);
      expect(service.toasts().length).toBe(0);
    });
  });

  describe('auto-dismiss', () => {
    it('should auto-dismiss after 5 seconds', () => {
      service.success('Auto');
      expect(service.toasts().length).toBe(1);
      vi.advanceTimersByTime(5000);
      expect(service.toasts().length).toBe(0);
    });

    it('should not auto-dismiss before 5 seconds', () => {
      service.success('Wait');
      vi.advanceTimersByTime(4999);
      expect(service.toasts().length).toBe(1);
    });
  });

  describe('dismiss', () => {
    it('should remove a specific toast', () => {
      service.success('A');
      service.error('B');
      const idToRemove = service.toasts()[0].id;
      service.dismiss(idToRemove);
      expect(service.toasts().length).toBe(1);
      expect(service.toasts()[0].message).toBe('B');
    });

    it('should clear the timer when dismissed manually', () => {
      service.success('Manual');
      const id = service.toasts()[0].id;
      service.dismiss(id);

      // Advancing past auto-dismiss should not cause issues
      vi.advanceTimersByTime(6000);
      expect(service.toasts().length).toBe(0);
    });

    it('should handle dismissing non-existent id gracefully', () => {
      expect(() => service.dismiss(99999)).not.toThrow();
    });
  });
});
