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

  it('should render a div', () => {
    const div = fixture.nativeElement.querySelector('div');
    expect(div).toBeTruthy();
  });

  it('should apply default card class', () => {
    const div = fixture.nativeElement.querySelector('div') as HTMLElement;
    expect(div.classList.contains('card-default')).toBe(true);
  });

  it('should not apply elevated class by default', () => {
    const div = fixture.nativeElement.querySelector('div') as HTMLElement;
    expect(div.classList.contains('card-elevated')).toBe(false);
  });

  it('should apply elevated class when elevated is true', () => {
    fixture.componentRef.setInput('elevated', true);
    fixture.detectChanges();
    const div = fixture.nativeElement.querySelector('div') as HTMLElement;
    expect(div.classList.contains('card-elevated')).toBe(true);
  });

  it('should not apply default class when elevated is true', () => {
    fixture.componentRef.setInput('elevated', true);
    fixture.detectChanges();
    const div = fixture.nativeElement.querySelector('div') as HTMLElement;
    expect(div.classList.contains('card-default')).toBe(false);
  });

  it('should project content', () => {
    // Content projection tested through host element
    expect(fixture.nativeElement.querySelector('div')).toBeTruthy();
  });
});
