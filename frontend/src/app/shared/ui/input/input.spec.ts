import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { InputComponent } from './input';

describe('InputComponent', () => {
  let component: InputComponent;
  let fixture: ComponentFixture<InputComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InputComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(InputComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render an input element', () => {
    const input = fixture.nativeElement.querySelector('input');
    expect(input).toBeTruthy();
  });

  it('should not render label when not provided', () => {
    const label = fixture.nativeElement.querySelector('label');
    expect(label).toBeNull();
  });

  it('should render label when provided', () => {
    fixture.componentRef.setInput('label', 'Email');
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('label');
    expect(label).toBeTruthy();
    expect(label.textContent).toContain('Email');
  });

  it('should associate label with input via for/id', () => {
    fixture.componentRef.setInput('label', 'Name');
    fixture.detectChanges();
    const label = fixture.nativeElement.querySelector('label') as HTMLLabelElement;
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(label.getAttribute('for')).toBe(input.id);
  });

  it('should apply placeholder', () => {
    fixture.componentRef.setInput('placeholder', 'Enter email');
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.placeholder).toBe('Enter email');
  });

  it('should apply input type', () => {
    fixture.componentRef.setInput('type', 'password');
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.type).toBe('password');
  });

  it('should default to text type', () => {
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.type).toBe('text');
  });

  it('should disable the input when disabled is true', () => {
    fixture.componentRef.setInput('disabled', true);
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.disabled).toBe(true);
  });

  it('should not show error message by default', () => {
    const errorEl = fixture.nativeElement.querySelector('.input-error');
    expect(errorEl).toBeNull();
  });

  it('should show error message when error is set', () => {
    fixture.componentRef.setInput('error', 'Ce champ est requis');
    fixture.detectChanges();
    const errorEl = fixture.nativeElement.querySelector('.input-error');
    expect(errorEl).toBeTruthy();
    expect(errorEl.textContent).toContain('Ce champ est requis');
  });

  it('should set aria-invalid when error is present', () => {
    fixture.componentRef.setInput('error', 'Invalid');
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-invalid')).toBe('true');
  });

  it('should not set aria-invalid when no error', () => {
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.getAttribute('aria-invalid')).toBeNull();
  });

  it('should set aria-describedby to error id when error is present', () => {
    fixture.componentRef.setInput('error', 'Error message');
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    const errorEl = fixture.nativeElement.querySelector('.input-error') as HTMLElement;
    expect(input.getAttribute('aria-describedby')).toBe(errorEl.id);
  });

  it('should apply error state class when error is present', () => {
    fixture.componentRef.setInput('error', 'Error');
    fixture.detectChanges();
    const input = fixture.nativeElement.querySelector('input') as HTMLInputElement;
    expect(input.classList.contains('input-error-state')).toBe(true);
  });

  it('should have role alert on error message', () => {
    fixture.componentRef.setInput('error', 'Error');
    fixture.detectChanges();
    const errorEl = fixture.nativeElement.querySelector('.input-error');
    expect(errorEl.getAttribute('role')).toBe('alert');
  });
});
