import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TicketIssue } from './ticket-issue';

describe('TicketIssue', () => {
  let component: TicketIssue;
  let fixture: ComponentFixture<TicketIssue>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TicketIssue],
    }).compileComponents();

    fixture = TestBed.createComponent(TicketIssue);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
