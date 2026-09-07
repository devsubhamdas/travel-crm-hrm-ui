import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerDocuments } from './customer-documents';

describe('CustomerDocuments', () => {
  let component: CustomerDocuments;
  let fixture: ComponentFixture<CustomerDocuments>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerDocuments],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerDocuments);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
