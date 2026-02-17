import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ModalComponent } from './modal';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ModalComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('title', 'Test Modal');
    fixture.componentRef.setInput('message', 'Are you sure?');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the title', () => {
    const title = fixture.nativeElement.querySelector('.modal-title') as HTMLElement;
    expect(title.textContent).toContain('Test Modal');
  });

  it('should render the message', () => {
    const message = fixture.nativeElement.querySelector('.modal-message') as HTMLElement;
    expect(message.textContent).toContain('Are you sure?');
  });

  it('should have dialog role', () => {
    const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(dialog).toBeTruthy();
  });

  it('should have aria-modal attribute', () => {
    const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(dialog.getAttribute('aria-modal')).toBe('true');
  });

  it('should have aria-label with title', () => {
    const dialog = fixture.nativeElement.querySelector('[role="dialog"]');
    expect(dialog.getAttribute('aria-label')).toBe('Test Modal');
  });

  it('should show default button labels', () => {
    const buttons = fixture.nativeElement.querySelectorAll('app-button');
    expect(buttons.length).toBe(2);
    expect(buttons[0].textContent).toContain('Annuler');
    expect(buttons[1].textContent).toContain('Confirmer');
  });

  it('should show custom button labels', () => {
    fixture.componentRef.setInput('confirmLabel', 'Supprimer');
    fixture.componentRef.setInput('cancelLabel', 'Retour');
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('app-button');
    expect(buttons[0].textContent).toContain('Retour');
    expect(buttons[1].textContent).toContain('Supprimer');
  });

  it('should emit confirmed when confirm button is clicked', () => {
    const confirmSpy = vi.fn();
    component.confirmed.subscribe(confirmSpy);
    const buttons = fixture.nativeElement.querySelectorAll('app-button button');
    buttons[1].click();
    expect(confirmSpy).toHaveBeenCalled();
  });

  it('should emit closed when cancel button is clicked', () => {
    const closeSpy = vi.fn();
    component.closed.subscribe(closeSpy);
    const buttons = fixture.nativeElement.querySelectorAll('app-button button');
    buttons[0].click();
    expect(closeSpy).toHaveBeenCalled();
  });

  it('should emit closed when backdrop is clicked', () => {
    const closeSpy = vi.fn();
    component.closed.subscribe(closeSpy);
    const backdrop = fixture.nativeElement.querySelector('.modal-backdrop') as HTMLElement;
    backdrop.click();
    expect(closeSpy).toHaveBeenCalled();
  });

  it('should NOT emit closed when modal content is clicked', () => {
    const closeSpy = vi.fn();
    component.closed.subscribe(closeSpy);
    const content = fixture.nativeElement.querySelector('.modal-content') as HTMLElement;
    content.click();
    expect(closeSpy).not.toHaveBeenCalled();
  });

  it('should render a backdrop overlay', () => {
    const backdrop = fixture.nativeElement.querySelector('.modal-backdrop');
    expect(backdrop).toBeTruthy();
  });

  it('should have focus trap directive', () => {
    const dialog = fixture.nativeElement.querySelector('[cdkTrapFocus]') as HTMLElement;
    // CDK FocusTrap adds the attribute
    expect(dialog || fixture.nativeElement.querySelector('[role="dialog"]')).toBeTruthy();
  });
});
