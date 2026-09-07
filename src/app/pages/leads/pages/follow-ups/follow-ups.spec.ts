import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FollowUps } from './follow-ups';

describe('FollowUps', () => {
  let component: FollowUps;
  let fixture: ComponentFixture<FollowUps>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FollowUps],
    }).compileComponents();

    fixture = TestBed.createComponent(FollowUps);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
