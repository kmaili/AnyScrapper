import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcessBuilder } from './process-builder';

describe('ProcessBuilder', () => {
  let component: ProcessBuilder;
  let fixture: ComponentFixture<ProcessBuilder>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcessBuilder]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ProcessBuilder);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
