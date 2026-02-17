import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Subject } from 'rxjs';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ToastService } from '../../../core/services/toast.service';
import { ToastContainerComponent } from './toast-container';

function createMockBreakpointObserver(subject: Subject<BreakpointState>) {
  return {
    observe: vi.fn().mockReturnValue(subject.asObservable()),
  };
}

describe('ToastContainerComponent', () => {
  let component: ToastContainerComponent;
  let fixture: ComponentFixture<ToastContainerComponent>;
  let toastService: ToastService;
  let breakpointSubject: Subject<BreakpointState>;

  beforeEach(async () => {
    breakpointSubject = new Subject<BreakpointState>();

    await TestBed.configureTestingModule({
      imports: [ToastContainerComponent],
      providers: [
        {
          provide: BreakpointObserver,
          useValue: createMockBreakpointObserver(breakpointSubject),
        },
      ],
    }).compileComponents();

    toastService = TestBed.inject(ToastService);
    fixture = TestBed.createComponent(ToastContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // Emit initial breakpoint state (desktop)
    breakpointSubject.next({ matches: false, breakpoints: {} });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the container', () => {
    const container = fixture.nativeElement.querySelector('.toast-container');
    expect(container).toBeTruthy();
  });

  it('should use top-right position on desktop', () => {
    const container = fixture.nativeElement.querySelector('.toast-container') as HTMLElement;
    expect(container.classList.contains('toast-top-right')).toBe(true);
  });

  it('should use top-center position on mobile', () => {
    breakpointSubject.next({ matches: true, breakpoints: {} });
    fixture.detectChanges();
    const container = fixture.nativeElement.querySelector('.toast-container') as HTMLElement;
    expect(container.classList.contains('toast-top-center')).toBe(true);
  });

  it('should render toasts from service', () => {
    toastService.success('First toast');
    toastService.error('Second toast');
    fixture.detectChanges();
    const toasts = fixture.nativeElement.querySelectorAll('app-toast');
    expect(toasts.length).toBe(2);
  });

  it('should limit to max 3 visible toasts', () => {
    toastService.success('Toast 1');
    toastService.error('Toast 2');
    toastService.warning('Toast 3');
    toastService.info('Toast 4');
    fixture.detectChanges();
    const toasts = fixture.nativeElement.querySelectorAll('app-toast');
    expect(toasts.length).toBe(3);
  });

  it('should remove toast when dismissed', () => {
    toastService.success('Toast to dismiss');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('app-toast').length).toBe(1);

    const toasts = toastService.toasts();
    toastService.dismiss(toasts[0].id);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelectorAll('app-toast').length).toBe(0);
  });
});
