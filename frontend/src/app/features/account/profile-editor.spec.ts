import { HttpResponse, provideHttpClient } from '@angular/common/http';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { UserService } from '../../core/services/user.service';
import { ProfileEditorComponent } from './profile-editor';

function createMockUserService() {
  return {
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    uploadAvatar: vi.fn(),
  };
}

describe('ProfileEditorComponent', () => {
  let component: ProfileEditorComponent;
  let fixture: ComponentFixture<ProfileEditorComponent>;
  let mockUserService: ReturnType<typeof createMockUserService>;

  beforeEach(async () => {
    mockUserService = createMockUserService();

    await TestBed.configureTestingModule({
      imports: [ProfileEditorComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: UserService, useValue: mockUserService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ProfileEditorComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('userName', 'Jean Dupont');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render avatar component', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('app-avatar')).toBeTruthy();
  });

  it('should reject files over 10MB', () => {
    const file = new File(['x'], 'big.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 11 * 1024 * 1024 });

    const event = { target: { files: [file], value: '' } } as unknown as Event;
    component.onFileSelected(event);

    expect(component.errorMessage()).toBe('Le fichier ne doit pas dépasser 10 Mo');
    expect(mockUserService.uploadAvatar).not.toHaveBeenCalled();
  });

  it('should reject unsupported formats', () => {
    const file = new File(['x'], 'doc.pdf', { type: 'application/pdf' });

    const event = { target: { files: [file], value: '' } } as unknown as Event;
    component.onFileSelected(event);

    expect(component.errorMessage()).toBe(
      'Format non supporté. Formats acceptés : JPEG, PNG, WebP',
    );
    expect(mockUserService.uploadAvatar).not.toHaveBeenCalled();
  });

  it('should upload valid file and emit avatarChanged', () => {
    const avatarChangedSpy = vi.fn();
    component.avatarChanged.subscribe(avatarChangedSpy);

    const file = new File(['image'], 'avatar.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 1024 });

    mockUserService.uploadAvatar.mockReturnValue(
      of(
        new HttpResponse({
          body: { data: { avatarUrl: 'https://signed-url.example.com/avatar.png' } },
        }),
      ),
    );

    const event = { target: { files: [file], value: '' } } as unknown as Event;
    component.onFileSelected(event);

    expect(mockUserService.uploadAvatar).toHaveBeenCalledWith(file);
    expect(avatarChangedSpy).toHaveBeenCalledWith(
      'https://signed-url.example.com/avatar.png',
    );
  });

  it('should show error on upload failure', () => {
    const file = new File(['image'], 'avatar.png', { type: 'image/png' });
    Object.defineProperty(file, 'size', { value: 1024 });

    mockUserService.uploadAvatar.mockReturnValue(
      throwError(() => new Error('Upload failed')),
    );

    const event = { target: { files: [file], value: '' } } as unknown as Event;
    component.onFileSelected(event);

    expect(component.errorMessage()).toBe("Échec de l'upload de l'avatar");
  });
});
