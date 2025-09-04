import { TestBed } from '@angular/core/testing';

import { VehicleDrbNumberService } from './vehicle-drb-number.service';

describe('VehicleDrbNumberService', () => {
  let service: VehicleDrbNumberService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(VehicleDrbNumberService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
