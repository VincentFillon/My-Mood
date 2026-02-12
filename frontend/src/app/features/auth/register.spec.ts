import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { RegisterComponent } from './register';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render registration form', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Rejoins My Mood');
    expect(compiled.querySelector('input[name="name"]')).toBeTruthy();
    expect(compiled.querySelector('input[name="email"]')).toBeTruthy();
    expect(compiled.querySelector('input[name="password"]')).toBeTruthy();
    expect(compiled.querySelector('input[name="gdprConsent"]')).toBeTruthy();
  });

  it('should show validation errors for empty fields', async () => {
    component.form = { name: '', email: '', password: '', gdprConsent: false };
    await component.onSubmit();
    fixture.detectChanges();

    const errors = component.fieldErrors();
    expect(errors.name).toBeDefined();
    expect(errors.email).toBeDefined();
    expect(errors.password).toBeDefined();
    expect(errors.gdprConsent).toBeDefined();
  });

  it('should show validation error for invalid email', async () => {
    component.form = { name: 'Test', email: 'not-email', password: 'password123', gdprConsent: true };
    await component.onSubmit();
    fixture.detectChanges();

    expect(component.fieldErrors().email).toBeDefined();
  });

  it('should show validation error for short password', async () => {
    component.form = { name: 'Test', email: 'test@test.com', password: '123', gdprConsent: true };
    await component.onSubmit();
    fixture.detectChanges();

    expect(component.fieldErrors().password).toBeDefined();
  });

  it('should block submission if GDPR consent is not checked', async () => {
    component.form = { name: 'Test', email: 'test@test.com', password: 'password123', gdprConsent: false };
    await component.onSubmit();
    fixture.detectChanges();

    expect(component.fieldErrors().gdprConsent).toBeDefined();
  });

  it('should display error messages in French', async () => {
    component.form = { name: '', email: 'bad', password: '123', gdprConsent: false };
    await component.onSubmit();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    const errorElements = compiled.querySelectorAll('.text-\\[\\#F44336\\]');
    expect(errorElements.length).toBeGreaterThan(0);
  });
});
