import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CommunicationLog } from './communication-log';

describe('CommunicationLog', () => {
  let component: CommunicationLog;
  let fixture: ComponentFixture<CommunicationLog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CommunicationLog],
    }).compileComponents();

    fixture = TestBed.createComponent(CommunicationLog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
