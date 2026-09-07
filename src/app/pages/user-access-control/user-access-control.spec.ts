import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAccessControl } from './user-access-control';

describe('UserAccessControl', () => {
  let component: UserAccessControl;
  let fixture: ComponentFixture<UserAccessControl>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserAccessControl],
    }).compileComponents();

    fixture = TestBed.createComponent(UserAccessControl);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
