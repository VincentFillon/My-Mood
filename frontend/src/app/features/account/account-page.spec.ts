import { provideHttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { NotificationService } from '../../core/services/notification.service';
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

function createMockNotificationService() {
  const notificationSignal = signal<{ message: string; type: string } | null>(null);
  return {
    success: vi.fn(),
    error: vi.fn(),
    dismiss: vi.fn(),
    notification: notificationSignal.asReadonly(),
  };
}

describe('AccountPageComponent', () => {
  let component: AccountPageComponent;
  let fixture: ComponentFixture<AccountPageComponent>;
  let mockUserService: ReturnType<typeof createMockUserService>;
  let mockNotification: ReturnType<typeof createMockNotificationService>;

  beforeEach(async () => {
    mockUserService = createMockUserService();
    mockNotification = createMockNotificationService();

    await TestBed.configureTestingModule({
      imports: [AccountPageComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: UserService, useValue: mockUserService },
        { provide: NotificationService, useValue: mockNotification },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AccountPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should show skeleton while loading', async () => {
    // Reset to loading state
    component.loading.set(true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.skeleton-avatar')).toBeTruthy();
    expect(compiled.querySelectorAll('.skeleton-line').length).toBe(2);
  });

  it('should display profile data after loading', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(component.loading()).toBe(false);
    expect(component.name).toBe('Jean Dupont');
    expect(component.email).toBe('jean@example.com');
    expect(compiled.querySelector('input[name="name"]')).toBeTruthy();
  });

  it('should compute initials from name', () => {
    expect(component.initials()).toBe('JD');
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

    expect(mockNotification.success).toHaveBeenCalledWith('Profil mis à jour');
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
