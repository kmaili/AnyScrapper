import { TestBed } from '@angular/core/testing';

import { ProcessSimulation } from './process-simulation';

describe('ProcessSimulation', () => {
  let service: ProcessSimulation;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProcessSimulation);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
