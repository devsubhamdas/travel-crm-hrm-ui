import { TestBed } from '@angular/core/testing';

import { CrmBookings } from '../crm-bookings';

describe('CrmBookings', () => {
  let service: CrmBookings;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CrmBookings);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
