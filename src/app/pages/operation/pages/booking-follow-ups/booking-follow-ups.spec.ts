import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingFollowUps } from './booking-follow-ups';

describe('BookingFollowUps', () => {
  let component: BookingFollowUps;
  let fixture: ComponentFixture<BookingFollowUps>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BookingFollowUps],
    }).compileComponents();

    fixture = TestBed.createComponent(BookingFollowUps);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
