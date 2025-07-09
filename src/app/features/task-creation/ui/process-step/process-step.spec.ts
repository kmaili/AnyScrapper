import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessStep } from './process-step';

describe('ProcessStep', () => {
  let component: ProcessStep;
  let fixture: ComponentFixture<ProcessStep>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcessStep]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessStep);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
