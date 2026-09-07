import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PageMenubar } from './page-menubar';

describe('PageMenubar', () => {
  let component: PageMenubar;
  let fixture: ComponentFixture<PageMenubar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PageMenubar],
    }).compileComponents();

    fixture = TestBed.createComponent(PageMenubar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
