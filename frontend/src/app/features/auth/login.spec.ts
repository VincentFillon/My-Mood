import { provideHttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../core/auth/auth.service';
import { ToastService } from '../../core/services/toast.service';
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
  let toastService: ToastService;

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

    toastService = TestBed.inject(ToastService);
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should render login form', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('h1')?.textContent).toContain('Connecte-toi');
    expect(compiled.querySelectorAll('app-input').length).toBe(2);
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

  it('should show server error via ToastService', async () => {
    mockAuthService.login.mockImplementation(async () => {
      mockAuthService._errorSignal.set('Email ou mot de passe incorrect');
    });

    component.form = { email: 'test@test.com', password: 'password123' };
    await component.onSubmit();
    fixture.detectChanges();

    const toasts = toastService.toasts();
    expect(toasts.length).toBeGreaterThan(0);
    expect(toasts.some(t => t.message === 'Email ou mot de passe incorrect' && t.variant === 'error')).toBe(true);
  });

  it('should have ghost button link to register page', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const authLink = compiled.querySelector('.auth-link app-button');
    expect(authLink).toBeTruthy();
    expect(authLink?.textContent).toContain('Rejoins-nous');
  });
});
