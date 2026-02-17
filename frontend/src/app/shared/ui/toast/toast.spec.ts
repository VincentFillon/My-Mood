import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastComponent } from './toast';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ToastComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('message', 'Test message');
    fixture.componentRef.setInput('variant', 'success');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the message', () => {
    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.toast-message')?.textContent).toContain('Test message');
  });

  it('should apply success variant class', () => {
    const el = fixture.nativeElement.querySelector('.toast') as HTMLElement;
    expect(el.classList.contains('toast-success')).toBe(true);
  });

  it('should apply error variant class', () => {
    fixture.componentRef.setInput('variant', 'error');
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.toast') as HTMLElement;
    expect(el.classList.contains('toast-error')).toBe(true);
  });

  it('should apply warning variant class', () => {
    fixture.componentRef.setInput('variant', 'warning');
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.toast') as HTMLElement;
    expect(el.classList.contains('toast-warning')).toBe(true);
  });

  it('should apply info variant class', () => {
    fixture.componentRef.setInput('variant', 'info');
    fixture.detectChanges();
    const el = fixture.nativeElement.querySelector('.toast') as HTMLElement;
    expect(el.classList.contains('toast-info')).toBe(true);
  });

  it('should show correct icon for success', () => {
    const icon = fixture.nativeElement.querySelector('.toast-icon') as HTMLElement;
    expect(icon.textContent?.trim()).toBe('\u2713');
  });

  it('should show correct icon for error', () => {
    fixture.componentRef.setInput('variant', 'error');
    fixture.detectChanges();
    const icon = fixture.nativeElement.querySelector('.toast-icon') as HTMLElement;
    expect(icon.textContent?.trim()).toBe('\u2717');
  });

  it('should have role alert', () => {
    const el = fixture.nativeElement.querySelector('[role="alert"]');
    expect(el).toBeTruthy();
  });

  it('should have a close button', () => {
    const closeBtn = fixture.nativeElement.querySelector('.toast-close') as HTMLButtonElement;
    expect(closeBtn).toBeTruthy();
    expect(closeBtn.getAttribute('aria-label')).toBe('Fermer');
  });

  it('should emit closed when close button is clicked', () => {
    const closedSpy = vi.fn();
    component.closed.subscribe(closedSpy);
    const closeBtn = fixture.nativeElement.querySelector('.toast-close') as HTMLButtonElement;
    closeBtn.click();
    expect(closedSpy).toHaveBeenCalled();
  });
});
