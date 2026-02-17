import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { signal } from '@angular/core';
import { HeaderComponent } from './header';
import { AuthService } from '../../auth/auth.service';

function createMockAuthService() {
  return {
    currentUser: signal({ id: '1', name: 'Vincent Fillon', email: 'vincent@test.com' }),
    isAuthenticated: signal(true),
    logout: vi.fn(),
  };
}

describe('HeaderComponent', () => {
  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;
  let mockAuthService: ReturnType<typeof createMockAuthService>;

  beforeEach(async () => {
    mockAuthService = createMockAuthService();

    await TestBed.configureTestingModule({
      imports: [HeaderComponent],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: mockAuthService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── Layout ──

  it('should render a header element', () => {
    const header = fixture.nativeElement.querySelector('header') as HTMLElement;
    expect(header).toBeTruthy();
  });

  it('should display logo text "My Mood"', () => {
    const logo = fixture.nativeElement.querySelector('.header-logo') as HTMLElement;
    expect(logo).toBeTruthy();
    expect(logo.textContent!.trim()).toBe('My Mood');
  });

  it('should have logo link pointing to /', () => {
    const logoLink = fixture.nativeElement.querySelector('.header-logo') as HTMLAnchorElement;
    expect(logoLink.getAttribute('href')).toBe('/');
  });

  // ── Avatar ──

  it('should display avatar with user initials', () => {
    const avatar = fixture.nativeElement.querySelector('app-avatar');
    expect(avatar).toBeTruthy();
  });

  // ── Menu trigger ──

  it('should have a menu trigger button', () => {
    const trigger = fixture.nativeElement.querySelector('.avatar-trigger') as HTMLButtonElement;
    expect(trigger).toBeTruthy();
  });

  it('should have aria-label on menu trigger', () => {
    const trigger = fixture.nativeElement.querySelector('.avatar-trigger') as HTMLButtonElement;
    expect(trigger.getAttribute('aria-label')).toBe('Menu compte');
  });

  // ── Menu interaction ──

  it('should open menu and render items when trigger is clicked', async () => {
    const trigger = fixture.nativeElement.querySelector('.avatar-trigger') as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const menu = document.querySelector('.account-menu');
    expect(menu).toBeTruthy();

    const menuItems = document.querySelectorAll('[cdkmenuitem]');
    expect(menuItems.length).toBe(2);
  });

  it('should display user name and email in menu header', async () => {
    const trigger = fixture.nativeElement.querySelector('.avatar-trigger') as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const userName = document.querySelector('.menu-user-name');
    const userEmail = document.querySelector('.menu-user-email');
    expect(userName?.textContent?.trim()).toBe('Vincent Fillon');
    expect(userEmail?.textContent?.trim()).toBe('vincent@test.com');
  });

  it('should render "Mon compte" and "Déconnexion" menu items', async () => {
    const trigger = fixture.nativeElement.querySelector('.avatar-trigger') as HTMLButtonElement;
    trigger.click();
    fixture.detectChanges();
    await fixture.whenStable();

    const items = document.querySelectorAll('[cdkmenuitem]');
    expect(items[0]?.textContent?.trim()).toBe('Mon compte');
    expect(items[1]?.textContent?.trim()).toBe('Déconnexion');
  });

  it('should call authService.logout when onLogout is called', async () => {
    await component.onLogout();
    expect(mockAuthService.logout).toHaveBeenCalled();
  });

  // ── Accessibility ──

  it('should have navigation role on header', () => {
    const nav = fixture.nativeElement.querySelector('nav') as HTMLElement;
    expect(nav).toBeTruthy();
    expect(nav.getAttribute('aria-label')).toBe('Navigation principale');
  });
});
