import { TestBed } from '@angular/core/testing';

import { ProcessData } from './process-data';

describe('ProcessData', () => {
  let service: ProcessData;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProcessData);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
