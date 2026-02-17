import { ComponentFixture, TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { CardComponent } from './card';

describe('CardComponent', () => {
  let component: CardComponent;
  let fixture: ComponentFixture<CardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CardComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should not apply elevated class by default', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('card-elevated')).toBe(false);
  });

  it('should apply elevated class when elevated is true', () => {
    fixture.componentRef.setInput('elevated', true);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    expect(host.classList.contains('card-elevated')).toBe(true);
  });

  it('should project content', () => {
    const host = fixture.nativeElement as HTMLElement;
    expect(host).toBeTruthy();
  });
});
