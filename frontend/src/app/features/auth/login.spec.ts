import { provideHttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../core/auth/auth.service';
import { LoginComponent } from './login';

function createMockAuthService() {
  const errorSignal = signal<string | null>(null);
  const loadingSignal = signal(false);
  return {
    login: vi.fn().mockResolvedValue(undefined),
    register: vi.fn().mockResolvedValue(undefined),
    logout: vi.fn().mockResolvedValue(undefined),
    refresh: vi.fn().mockResolvedValue(undefined),
    tryRestoreSession: vi.fn().mockResolvedValue(undefined),
    loading: loadingSignal.asReadonly(),
    error: errorSignal.asReadonly(),
    currentUser: signal(null).asReadonly(),
    isAuthenticated: signal(false).asReadonly(),
    accessToken: null as string | null,
    _errorSignal: errorSignal,
    _loadingSignal: loadingSignal,
  };
}

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: ReturnType<typeof createMockAuthService>;

  beforeEach(async () => {
    mockAuthService = createMockAuthService();

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render login form', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Connecte-toi à My Mood');
    expect(compiled.querySelector('input[name="email"]')).toBeTruthy();
    expect(compiled.querySelector('input[name="password"]')).toBeTruthy();
  });

  it('should show validation errors for empty fields', async () => {
    component.form = { email: '', password: '' };
    await component.onSubmit();
    fixture.detectChanges();

    const errors = component.fieldErrors();
    expect(errors.email).toBeDefined();
    expect(errors.password).toBeDefined();
  });

  it('should show validation error for invalid email', async () => {
    component.form = { email: 'not-email', password: 'password123' };
    await component.onSubmit();
    fixture.detectChanges();

    expect(component.fieldErrors().email).toBeDefined();
  });

  it('should call authService.login with valid data', async () => {
    component.form = { email: 'test@test.com', password: 'password123' };
    await component.onSubmit();

    expect(mockAuthService.login).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'password123',
    });
  });

  it('should not call authService.login when validation fails', async () => {
    component.form = { email: 'bad', password: '' };
    await component.onSubmit();

    expect(mockAuthService.login).not.toHaveBeenCalled();
  });

  it('should display server error from authService', async () => {
    mockAuthService.login.mockImplementation(async () => {
      mockAuthService._errorSignal.set('Email ou mot de passe incorrect');
    });

    component.form = { email: 'test@test.com', password: 'password123' };
    await component.onSubmit();
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Email ou mot de passe incorrect');
  });

  it('should have link to register page', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const link = compiled.querySelector('a[href="/register"]');
    expect(link).toBeTruthy();
    expect(link?.textContent).toContain('Inscris-toi');
  });
});
