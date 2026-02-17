import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { AvatarComponent } from './avatar';

describe('AvatarComponent', () => {
  let component: AvatarComponent;
  let fixture: ComponentFixture<AvatarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AvatarComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AvatarComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('name', 'Vincent Fillon');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // ── Size variants ──

  it('should default to md size', () => {
    expect(component.size()).toBe('md');
  });

  it('should apply xs size class', () => {
    fixture.componentRef.setInput('size', 'xs');
    fixture.detectChanges();
    const wrapper = fixture.nativeElement.querySelector('.avatar') as HTMLElement;
    expect(wrapper.classList.contains('avatar-xs')).toBe(true);
  });

  it('should apply sm size class', () => {
    fixture.componentRef.setInput('size', 'sm');
    fixture.detectChanges();
    const wrapper = fixture.nativeElement.querySelector('.avatar') as HTMLElement;
    expect(wrapper.classList.contains('avatar-sm')).toBe(true);
  });

  it('should apply md size class', () => {
    const wrapper = fixture.nativeElement.querySelector('.avatar') as HTMLElement;
    expect(wrapper.classList.contains('avatar-md')).toBe(true);
  });

  it('should apply lg size class', () => {
    fixture.componentRef.setInput('size', 'lg');
    fixture.detectChanges();
    const wrapper = fixture.nativeElement.querySelector('.avatar') as HTMLElement;
    expect(wrapper.classList.contains('avatar-lg')).toBe(true);
  });

  it('should apply xl size class', () => {
    fixture.componentRef.setInput('size', 'xl');
    fixture.detectChanges();
    const wrapper = fixture.nativeElement.querySelector('.avatar') as HTMLElement;
    expect(wrapper.classList.contains('avatar-xl')).toBe(true);
  });

  // ── Image rendering ──

  it('should render image when src is provided', () => {
    fixture.componentRef.setInput('src', 'https://example.com/avatar.jpg');
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    expect(img).toBeTruthy();
    expect(img.src).toBe('https://example.com/avatar.jpg');
  });

  it('should set alt attribute from name', () => {
    fixture.componentRef.setInput('src', 'https://example.com/avatar.jpg');
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    expect(img.alt).toBe('Vincent Fillon');
  });

  // ── Fallback initials ──

  it('should show initials when no src is provided', () => {
    const initials = fixture.nativeElement.querySelector('.avatar-initials') as HTMLElement;
    expect(initials).toBeTruthy();
    expect(initials.textContent!.trim()).toBe('VF');
  });

  it('should show single initial for single-word name', () => {
    fixture.componentRef.setInput('name', 'Vincent');
    fixture.detectChanges();
    const initials = fixture.nativeElement.querySelector('.avatar-initials') as HTMLElement;
    expect(initials.textContent!.trim()).toBe('V');
  });

  it('should show first and last initials for multi-word name', () => {
    fixture.componentRef.setInput('name', 'Jean Pierre Dupont');
    fixture.detectChanges();
    const initials = fixture.nativeElement.querySelector('.avatar-initials') as HTMLElement;
    expect(initials.textContent!.trim()).toBe('JD');
  });

  it('should not render img when no src is provided', () => {
    const img = fixture.nativeElement.querySelector('img');
    expect(img).toBeNull();
  });

  // ── Image error fallback ──

  it('should fallback to initials on image error', () => {
    fixture.componentRef.setInput('src', 'https://example.com/broken.jpg');
    fixture.detectChanges();

    const img = fixture.nativeElement.querySelector('img') as HTMLImageElement;
    expect(img).toBeTruthy();

    // Simulate image error
    img.dispatchEvent(new Event('error'));
    fixture.detectChanges();

    const initials = fixture.nativeElement.querySelector('.avatar-initials') as HTMLElement;
    expect(initials).toBeTruthy();
    expect(initials.textContent!.trim()).toBe('VF');
  });

  // ── Status indicator ──

  it('should not show status indicator by default', () => {
    const status = fixture.nativeElement.querySelector('.avatar-status');
    expect(status).toBeNull();
  });

  it('should show online status indicator', () => {
    fixture.componentRef.setInput('showStatus', true);
    fixture.componentRef.setInput('online', true);
    fixture.detectChanges();
    const status = fixture.nativeElement.querySelector('.avatar-status') as HTMLElement;
    expect(status).toBeTruthy();
    expect(status.classList.contains('avatar-status--online')).toBe(true);
  });

  it('should show offline status indicator', () => {
    fixture.componentRef.setInput('showStatus', true);
    fixture.componentRef.setInput('online', false);
    fixture.detectChanges();
    const status = fixture.nativeElement.querySelector('.avatar-status') as HTMLElement;
    expect(status).toBeTruthy();
    expect(status.classList.contains('avatar-status--offline')).toBe(true);
  });

  // ── Accessibility ──

  it('should have aria-label on the avatar container', () => {
    const wrapper = fixture.nativeElement.querySelector('.avatar') as HTMLElement;
    expect(wrapper.getAttribute('aria-label')).toBe('Avatar de Vincent Fillon');
  });
});
