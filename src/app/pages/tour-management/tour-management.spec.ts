import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TourManagement } from './tour-management';

describe('TourManagement', () => {
  let component: TourManagement;
  let fixture: ComponentFixture<TourManagement>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TourManagement],
    }).compileComponents();

    fixture = TestBed.createComponent(TourManagement);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
