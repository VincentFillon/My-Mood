import { provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastService } from '../../core/services/toast.service';
import { UserService } from '../../core/services/user.service';
import { AccountPageComponent } from './account-page';

const mockProfile = {
  id: 'user-1',
  name: 'Jean Dupont',
  email: 'jean@example.com',
  avatarUrl: null,
};

function createMockUserService() {
  return {
    getProfile: vi.fn().mockReturnValue(of({ data: mockProfile })),
    updateProfile: vi.fn().mockReturnValue(of({ data: mockProfile })),
    uploadAvatar: vi.fn(),
  };
}

describe('AccountPageComponent', () => {
  let component: AccountPageComponent;
  let fixture: ComponentFixture<AccountPageComponent>;
  let mockUserService: ReturnType<typeof createMockUserService>;
  let toastService: ToastService;

  beforeEach(async () => {
    mockUserService = createMockUserService();

    await TestBed.configureTestingModule({
      imports: [AccountPageComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: UserService, useValue: mockUserService },
      ],
    }).compileComponents();

    toastService = TestBed.inject(ToastService);
    fixture = TestBed.createComponent(AccountPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show skeleton while loading', async () => {
    component.loading.set(true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.skeleton-avatar')).toBeTruthy();
    expect(compiled.querySelectorAll('.skeleton-line').length).toBe(2);
  });

  it('should display profile data after loading', () => {
    expect(component.loading()).toBe(false);
    expect(component.name).toBe('Jean Dupont');
    expect(component.email).toBe('jean@example.com');

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelectorAll('app-input').length).toBe(2);
  });

  it('should show error state when profile loading fails', () => {
    mockUserService.getProfile.mockReturnValue(
      throwError(() => new Error('Network error')),
    );

    // Recreate the component to trigger ngOnInit with the failing service
    const errorFixture = TestBed.createComponent(AccountPageComponent);
    errorFixture.detectChanges();

    const errorComponent = errorFixture.componentInstance;
    expect(errorComponent.loadError()).toBe(true);
    expect(errorComponent.loading()).toBe(false);

    const compiled = errorFixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.error-text')).toBeTruthy();
  });

  it('should call updateProfile on valid submit', () => {
    component.name = 'Nouveau Nom';
    component.email = 'new@example.com';
    component.onSubmit();

    expect(mockUserService.updateProfile).toHaveBeenCalledWith({
      name: 'Nouveau Nom',
      email: 'new@example.com',
    });
  });

  it('should show success toast on update', () => {
    component.name = 'Test';
    component.email = 'test@example.com';
    component.onSubmit();

    const toasts = toastService.toasts();
    expect(toasts.some(t => t.message === 'Profil mis à jour' && t.variant === 'success')).toBe(true);
  });

  it('should show validation errors for invalid data', () => {
    component.name = 'A'; // too short
    component.email = 'bad';
    component.onSubmit();

    expect(component.nameError()).toBeTruthy();
    expect(component.emailError()).toBeTruthy();
    expect(mockUserService.updateProfile).not.toHaveBeenCalled();
  });

  it('should show inline error on 409 conflict', () => {
    mockUserService.updateProfile.mockReturnValue(
      throwError(() => ({ status: 409 })),
    );

    component.name = 'Test Name';
    component.email = 'taken@example.com';
    component.onSubmit();
    fixture.detectChanges();

    expect(component.emailError()).toBe('Cet email est déjà utilisé');
  });
});
