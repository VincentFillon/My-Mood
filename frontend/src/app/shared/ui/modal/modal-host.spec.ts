import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ModalService } from '../../../core/services/modal.service';
import { ModalHostComponent } from './modal-host';

describe('ModalHostComponent', () => {
  let component: ModalHostComponent;
  let fixture: ComponentFixture<ModalHostComponent>;
  let modalService: ModalService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalHostComponent],
    }).compileComponents();

    modalService = TestBed.inject(ModalService);
    fixture = TestBed.createComponent(ModalHostComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not render modal when no config', () => {
    const modal = fixture.nativeElement.querySelector('app-modal');
    expect(modal).toBeNull();
  });

  it('should render modal when service has config', () => {
    modalService.open({ title: 'Test', message: 'Are you sure?' });
    fixture.detectChanges();
    const modal = fixture.nativeElement.querySelector('app-modal');
    expect(modal).toBeTruthy();
  });

  it('should pass title and message to modal', () => {
    modalService.open({ title: 'Delete', message: 'Delete this item?' });
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('.modal-title') as HTMLElement;
    expect(title.textContent).toContain('Delete');
  });

  it('should close modal after handleConfirm', () => {
    const result$ = modalService.confirm('Title', 'Message');
    const resultSpy = vi.fn();
    result$.subscribe(resultSpy);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-modal')).toBeTruthy();

    modalService.handleConfirm();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-modal')).toBeNull();
    expect(resultSpy).toHaveBeenCalledWith(true);
  });

  it('should close modal after handleClose', () => {
    const result$ = modalService.confirm('Title', 'Message');
    const resultSpy = vi.fn();
    result$.subscribe(resultSpy);
    fixture.detectChanges();

    modalService.handleClose();
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-modal')).toBeNull();
    expect(resultSpy).toHaveBeenCalledWith(false);
  });
});
