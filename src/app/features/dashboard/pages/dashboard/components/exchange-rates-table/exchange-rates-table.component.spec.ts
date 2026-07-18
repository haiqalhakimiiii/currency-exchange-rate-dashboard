import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ExchangeRatesTableComponent } from './exchange-rates-table.component';

describe('ExchangeRatesTableComponent', () => {
  let component: ExchangeRatesTableComponent;
  let fixture: ComponentFixture<ExchangeRatesTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExchangeRatesTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ExchangeRatesTableComponent);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
