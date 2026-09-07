import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainSidebar } from './main-sidebar';

describe('MainSidebar', () => {
  let component: MainSidebar;
  let fixture: ComponentFixture<MainSidebar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainSidebar],
    }).compileComponents();

    fixture = TestBed.createComponent(MainSidebar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
