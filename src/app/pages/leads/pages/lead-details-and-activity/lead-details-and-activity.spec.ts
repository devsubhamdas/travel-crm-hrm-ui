import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LeadDetailsAndActivity } from './lead-details-and-activity';

describe('LeadDetailsAndActivity', () => {
  let component: LeadDetailsAndActivity;
  let fixture: ComponentFixture<LeadDetailsAndActivity>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LeadDetailsAndActivity],
    }).compileComponents();

    fixture = TestBed.createComponent(LeadDetailsAndActivity);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
